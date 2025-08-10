import { httpRouter } from "convex/server";
import { httpAction, internalMutation } from "./_generated/server";
import { api } from "./_generated/api"
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
            console.error("Missing svix headers:", { svix_id, svix_timestamp, svix_signature });
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
        } catch (err) {
            console.error("Webhook verification failed:", err);
            return new Response("Webhook verification failed", { status: 400 });
        }

        if (evt.type === "user.created") {
            const { id, email_addresses } = evt.data;
            console.log("User created event received:", evt.data);
            
            if (!email_addresses || email_addresses.length === 0) {
                console.error("No email addresses found:", evt.data);
                return new Response("No email addresses found", { status: 400 });
            }
            
            const email = email_addresses[0].email_address;

            if (!email) {
                console.error("Invalid email structure:", email_addresses);
                return new Response("Invalid email", { status: 400 });
            }

            try {
                await ctx.runMutation(api.users.createUser, {
                    clerkId: id,
                    email,
                    birthYear: undefined,
                });
                console.log("User created successfully:", { clerkId: id, email });
            } catch (error) {
                console.error("Error creating user:", error);
                return new Response("Error creating user", { status: 500 });
            }
        }

        if ( evt.type === "user.deleted" ) {
            const { id } = evt.data;
            console.log("User deleted event received:", evt.data);
            try {
                await ctx.runMutation(api.users.deleteUserByClerkId, { clerkId: id });
                console.log("User deleted successfully:", { clerkId: id });
            } catch (error) {
                console.error("Error deleting user:", error);
                return new Response("Error deleting user", { status: 500 });
            }
        }

        return new Response("Webhook processed successfully", { status: 200 });
    })
});

export default http;