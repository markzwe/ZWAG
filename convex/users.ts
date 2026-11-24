import { ConvexError, v } from "convex/values";
import { AI_CONSENT_VERSION } from "../constants/aiConsent";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function findUserByClerkId(ctx: QueryCtx | MutationCtx, clerkId: string) {
  return ctx.db.query("users").withIndex("byClerkId", q => q.eq("clerkId", clerkId)).first();
}

export const createUser = internalMutation({
  args: { clerkId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const existing = await findUserByClerkId(ctx, args.clerkId);
    if (existing) {
      if (!existing.email && args.email && !existing.deletingAt) await ctx.db.patch(existing._id, { email: args.email });
      return;
    }
    if (await ctx.db.query("deletedAccounts").withIndex("byClerkId", q => q.eq("clerkId", args.clerkId)).first()) return;
    await ctx.db.insert("users", { ...args, numberOfClothes: 0 });
  },
});

// This fallback can only provision the verified caller while the webhook catches up.
export const prepareMyProfile = mutation({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Sign in to continue.");
    if (await findUserByClerkId(ctx, identity.subject)) return;
    const deleted = await ctx.db.query("deletedAccounts").withIndex("byClerkId", q => q.eq("clerkId", identity.subject)).first();
    if (deleted) return;
    await ctx.db.insert("users", {
      clerkId: identity.subject, email: "", numberOfClothes: 0,
    });
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Sign in to continue.");
  const user = await findUserByClerkId(ctx, identity.subject);
  if (!user) throw new ConvexError("Your account is still being set up.");
  return user;
}

export async function requireActiveUser(ctx: QueryCtx | MutationCtx) {
  const user = await getAuthenticatedUser(ctx);
  if (user.deletingAt !== undefined) throw new ConvexError("This account is being deleted.");
  return user;
}

export const getAccountStatus = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await findUserByClerkId(ctx, identity.subject);
    const deleted = !user && !!await ctx.db.query("deletedAccounts")
      .withIndex("byClerkId", q => q.eq("clerkId", identity.subject)).first();
    const deleting = user?.deletingAt !== undefined;
    return {
      profileReady: !!user,
      canUseApp: !!user && !deleting,
      aiConsent: user?.aiConsentVersion === AI_CONSENT_VERSION && !deleting,
      deleting,
      deletionFailed: user?.deletionFailed === true,
      deleted,
    };
  },
});

export const getCurrentUser = query({ args: {}, handler: requireActiveUser });

export const setAiConsent = mutation({
  args: { allowed: v.boolean(), version: v.number() },
  handler: async (ctx, { allowed, version }) => {
    const user = await requireActiveUser(ctx);
    if (allowed && version !== AI_CONSENT_VERSION) throw new ConvexError("Update ZWAG to review the current AI disclosure.");
    await ctx.db.patch(user._id, {
      aiConsentVersion: allowed ? version : undefined,
      aiConsentAt: allowed ? Date.now() : undefined,
    });
  },
});

export const authorizeAiRequest = internalMutation({
  args: {},
  handler: async ctx => {
    const user = await requireActiveUser(ctx);
    if (user.aiConsentVersion !== AI_CONSENT_VERSION) {
      throw new ConvexError("Allow OpenAI sharing to chat with Zwag.");
    }
    const day = Math.floor(Date.now() / 86_400_000);
    const requestCount = user.aiRequestDay === day ? user.aiRequestCount ?? 0 : 0;
    if (requestCount >= 30) throw new ConvexError("Daily AI limit reached. Try again tomorrow.");
    await ctx.db.patch(user._id, { aiRequestDay: day, aiRequestCount: requestCount + 1 });
  },
});

export const updateStylePreferences = mutation({
  args: {
    stylePreferences: v.optional(v.array(v.string())),
    favoriteColors: v.optional(v.array(v.string())),
    fitPreference: v.optional(v.string()),
    avoidClothing: v.optional(v.string()),
    preferredOccasions: v.optional(v.array(v.string())),
    preferredBrands: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveUser(ctx);
    await ctx.db.patch(user._id, Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined)));
  },
});

export const clearLegacyMeasurements = internalMutation({
  args: { cursor: v.union(v.string(), v.null()), dryRun: v.boolean() },
  handler: async (ctx, { cursor, dryRun }) => {
    const { page, isDone, continueCursor } = await ctx.db.query("users").paginate({ numItems: 100, cursor });
    let affected = 0;
    for (const user of page) {
      if (user.height === undefined && user.weight === undefined && user.bodyType === undefined && user.birthYear === undefined) continue;
      affected++;
      if (!dryRun) await ctx.db.patch(user._id, {
        height: undefined, weight: undefined, bodyType: undefined, birthYear: undefined,
      });
    }
    return { affected, isDone, continueCursor };
  },
});
