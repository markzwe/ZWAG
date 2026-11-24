import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api"
import { Webhook } from "svix";

const http = httpRouter();

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error("CLERK_WEBHOOK_SECRET is not set");
        }

        // Get the raw body first
        const body = await request.text();
        
        // Get svix headers for verification
        const svix_id = request.headers.get("svix-id");
        const svix_timestamp = request.headers.get("svix-timestamp");
        const svix_signature = request.headers.get("svix-signature");

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return new Response("Missing svix headers", { status: 400 });
        }

        // Create a new Webhook instance for signature verification
        const wh = new Webhook(webhookSecret);

        let evt: any;
        try {
            // Verify the payload
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch {
            return new Response("Webhook verification failed", { status: 400 });
        }

        if (evt.type === "user.created") {
            const { id, email_addresses, primary_email_address_id } = evt.data;
            const email = email_addresses?.find((address: { id: string }) => address.id === primary_email_address_id)?.email_address ?? "";
            await ctx.runMutation(internal.users.createUser, { clerkId: id, email });
        }

        if (evt.type === "user.deleted") {
            await ctx.runMutation(internal.accountDeletion.deleteUserByClerkId, { clerkId: evt.data.id });
        }

        return new Response("Webhook processed successfully", { status: 200 });
    })
});

http.route({
    path: "/closet-upload",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        if (!await ctx.auth.getUserIdentity()) return new Response("Sign in required", { status: 401 });
        if (!await ctx.runQuery(internal.items.canUpload, {})) return new Response("Access denied", { status: 403 });
        const limit = 10 * 1024 * 1024;
        const type = request.headers.get("content-type");
        if (type !== "image/png" && type !== "image/jpeg") return new Response("Unsupported image type", { status: 415 });
        if (Number(request.headers.get("content-length")) > limit) return new Response("Image is too large", { status: 413 });
        const image = await request.blob();
        if (!image.size || image.size > limit) return new Response("Image is empty or too large", { status: 413 });
        const bytes = new Uint8Array(await image.slice(0, 8).arrayBuffer());
        const expected = type === "image/png" ? [137, 80, 78, 71, 13, 10, 26, 10] : [255, 216, 255];
        if (!expected.every((byte, index) => bytes[index] === byte)) return new Response("Invalid image", { status: 415 });
        const storageId = await ctx.storage.store(image);
        try {
            await ctx.runMutation(internal.items.registerUpload, { storageId });
            return Response.json({ storageId });
        } catch {
            const registered = await ctx.runQuery(internal.items.isUploadRegistered, { storageId });
            if (!registered) await ctx.storage.delete(storageId);
            return new Response("Could not register upload", { status: 409 });
        }
    }),
});

export default http;