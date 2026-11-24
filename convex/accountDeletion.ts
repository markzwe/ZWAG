import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalAction, internalMutation, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { findUserByClerkId, getAuthenticatedUser } from "./users";

async function queueDeletion(ctx: MutationCtx, user: Doc<"users">, clerkDeleted = false) {
  const job = user.deletionJob ? await ctx.db.system.get("_scheduled_functions", user.deletionJob) : null;
  const active = job?.state.kind === "pending" || job?.state.kind === "inProgress";
  const deletionJob = active ? user.deletionJob : await ctx.scheduler.runAfter(0, internal.accountDeletion.runDeletion, {
    userId: user._id, attempt: 0,
  });
  await ctx.db.patch(user._id, {
    deletingAt: user.deletingAt ?? Date.now(),
    clerkDeleted: clerkDeleted || user.clerkDeleted === true,
    deletionJob, deletionFailed: undefined, aiConsentAt: undefined, aiConsentVersion: undefined,
  });
}

export const deleteAccount = mutation({
  args: {},
  handler: async ctx => {
    const user = await getAuthenticatedUser(ctx);
    if (!user.deletingAt && !process.env.CLERK_SECRET_KEY?.trim()) {
      throw new ConvexError("Account deletion is unavailable. Please contact ZWAG support.");
    }
    await queueDeletion(ctx, user);
  },
});

export const deleteUserByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const tombstone = await ctx.db.query("deletedAccounts").withIndex("byClerkId", q => q.eq("clerkId", clerkId)).first();
    if (!tombstone) await ctx.db.insert("deletedAccounts", { clerkId });
    const user = await findUserByClerkId(ctx, clerkId);
    if (user) await queueDeletion(ctx, user, true);
  },
});

export const cleanBatch = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.deletingAt === undefined) return { state: "done" as const };

    const feedback = await ctx.db.query("outfitFeedback").withIndex("by_user", q => q.eq("userId", userId)).take(32);
    const history = await ctx.db.query("outfitHistory").withIndex("by_user", q => q.eq("userId", userId)).take(32);
    const outfits = await ctx.db.query("outfits").withIndex("byUser", q => q.eq("userId", userId)).take(32);
    const items = await ctx.db.query("items").withIndex("by_userId", q => q.eq("userId", userId)).take(32);
    const uploads = await ctx.db.query("uploads").withIndex("byUser", q => q.eq("userId", userId)).take(32);
    for (const row of feedback) await ctx.db.delete(row._id);
    for (const row of history) await ctx.db.delete(row._id);
    for (const row of outfits) await ctx.db.delete(row._id);
    for (const item of items) {
      const storageId = ctx.db.system.normalizeId("_storage", item.storageId);
      if (storageId) {
        // Legacy clients could attach the same file to multiple items.
        const other = await ctx.db.query("items").withIndex("byStorageId", q => q.eq("storageId", item.storageId))
          .filter(q => q.neq(q.field("_id"), item._id)).first();
        if (!other && await ctx.db.system.get("_storage", storageId)) await ctx.storage.delete(storageId);
      }
      await ctx.db.delete(item._id);
    }
    for (const upload of uploads) {
      if (await ctx.db.system.get("_storage", upload.storageId)) await ctx.storage.delete(upload.storageId);
      await ctx.db.delete(upload._id);
    }
    if (feedback.length || history.length || outfits.length || items.length || uploads.length) {
      return { state: "more" as const };
    }

    if (!user.legacyInvitesCleaned) {
      const { page, continueCursor, isDone } = await ctx.db.query("inviteCodes")
        .paginate({ cursor: user.legacyInviteCursor ?? null, numItems: 32 });
      for (const invite of page) {
        const redeemedBy = invite.redeemedBy ?? [];
        if (redeemedBy.includes(user.clerkId)) {
          await ctx.db.patch(invite._id, {
            redeemedBy: redeemedBy.filter(id => id !== user.clerkId),
          });
        }
      }
      await ctx.db.patch(userId, { legacyInvitesCleaned: isDone, legacyInviteCursor: isDone ? undefined : continueCursor });
      if (!isDone) return { state: "more" as const };
    }
    return { state: "clerk" as const, clerkId: user.clerkId, clerkDeleted: user.clerkDeleted === true };
  },
});

export const finishDeletion = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.deletingAt === undefined) return;
    const tombstone = await ctx.db.query("deletedAccounts").withIndex("byClerkId", q => q.eq("clerkId", user.clerkId)).first();
    if (!tombstone) await ctx.db.insert("deletedAccounts", { clerkId: user.clerkId });
    await ctx.db.delete(userId);
  },
});

export const continueDeletion = internalMutation({
  args: { userId: v.id("users"), attempt: v.number() },
  handler: async (ctx, { userId, attempt }) => {
    if (!(await ctx.db.get(userId))) return;
    if (attempt > 5) {
      await ctx.db.patch(userId, { deletionFailed: true, deletionJob: undefined });
      return;
    }
    const delay = attempt === 0 ? 0 : 30_000 * 2 ** (attempt - 1);
    const job = await ctx.scheduler.runAfter(delay, internal.accountDeletion.runDeletion, { userId, attempt });
    await ctx.db.patch(userId, { deletionJob: job });
  },
});

export const runDeletion = internalAction({
  args: { userId: v.id("users"), attempt: v.number() },
  handler: async (ctx, { userId, attempt }): Promise<void> => {
    try {
      const batch = await ctx.runMutation(internal.accountDeletion.cleanBatch, { userId });
      if (batch.state === "done") return;
      if (batch.state === "more") {
        await ctx.runMutation(internal.accountDeletion.continueDeletion, { userId, attempt: 0 });
        return;
      }
      if (!batch.clerkDeleted) {
        const secret = process.env.CLERK_SECRET_KEY?.trim();
        if (!secret) throw new Error("Clerk secret missing.");
        const response = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(batch.clerkId)}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok && response.status !== 404) throw new Error("Clerk deletion failed.");
      }
      await ctx.runMutation(internal.accountDeletion.finishDeletion, { userId });
    } catch {
      console.warn("Account cleanup interrupted; scheduling retry.");
      await ctx.runMutation(internal.accountDeletion.continueDeletion, { userId, attempt: attempt + 1 });
    }
  },
});
