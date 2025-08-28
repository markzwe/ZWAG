// ...existing code...
import { mutation, query } from "./_generated/server";

// helper to generate random code
function generateInviteCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function normalizeCode(code: string) {
  return (code || "").toUpperCase().trim();
}

// admin: create a new code (ensures uniqueness)
export const createInviteCode = mutation(
  async (
    ctx,
    { uses = 1, length = 6 }: { uses?: number; length?: number }
  ) => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateInviteCode(length);
    const existing = await ctx.db
      .query("inviteCodes")
      .filter(q => q.eq(q.field("code"), code))
      .first();

    if (!existing) {
      const now = Date.now();
      await ctx.db.insert("inviteCodes", {
        code,
        maxUses: uses,
        redeemedBy: [],
        createdAt: now,
        expiresAt: undefined,
      });
      return code;
    }
  }
  throw new Error("Failed to generate unique invite code");
});

// validator to check code before signup (does NOT consume)
export const validateInviteCode = mutation(async (ctx, { code }: { code: string }) => {
  const norm = normalizeCode(code);
  if (!norm) return { valid: false, reason: "Empty code" };

  const invite = await ctx.db
    .query("inviteCodes")
    .filter(q => q.eq(q.field("code"), norm))
    .first();

  if (!invite) return { valid: false, reason: "Code not found" };
  if (invite.expiresAt && invite.expiresAt < Date.now()) return { valid: false, reason: "Expired" };

  const usesLeft = (invite.maxUses ?? 1) - (invite.redeemedBy?.length ?? 0);
  if (usesLeft <= 0) return { valid: false, reason: "No uses left" };

  return { valid: true, usesLeft };
});

// user: redeem a code at signup (consumes and records user)
export const redeemInviteCode = mutation(async (ctx, { code, userId }: { code: string; userId: string }) => {
  const norm = normalizeCode(code);
  if (!norm) throw new Error("Invalid code");

  const invite = await ctx.db
    .query("inviteCodes")
    .filter(q => q.eq(q.field("code"), norm))
    .first();

  if (!invite) throw new Error("Invalid or expired invite code");
  if (invite.expiresAt && invite.expiresAt < Date.now()) throw new Error("Expired invite code");

  // prevent double-redeem by same user
  const redeemedBy = invite.redeemedBy ?? [];
  if (redeemedBy.includes(userId)) return { success: true, alreadyRedeemed: true };

  const usesLeft = (invite.maxUses ?? 1) - redeemedBy.length;
  if (usesLeft <= 0) throw new Error("Invite code has no remaining uses");

  // record redemption
  await ctx.db.patch(invite._id, { redeemedBy: redeemedBy.concat([userId]) });
  return { success: true };
});

// admin: list all invite codes
export const listInviteCodes = query(async (ctx) => {
  return await ctx.db.query("inviteCodes").collect();
});

// admin: create multiple test codes
export const createTestInviteCodes = mutation(async (ctx) => {
  const codes = [];
  for (let i = 0; i < 5; i++) {
    const code = generateInviteCode(6);
    const existing = await ctx.db
      .query("inviteCodes")
      .filter(q => q.eq(q.field("code"), code))
      .first();

    if (!existing) {
      const now = Date.now();
      await ctx.db.insert("inviteCodes", {
        code,
        maxUses: 10,
        redeemedBy: [],
        createdAt: now,
        expiresAt: undefined,
      });
      codes.push(code);
    }
  }
  return codes;
});