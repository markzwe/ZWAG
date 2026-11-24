# Development setup

Run commands from the Zwag repository root. Node version ranges are in [package.json](../package.json). The iOS flow uses macOS, Xcode, the iOS simulator runtime or a paired iPhone, and CocoaPods. The checked-in iOS target supports iOS 16.4 and later. Automatic background removal requires iOS 17 or later and working Vision inference.

## 1. Install dependencies

```sh
npm ci
```

Set up the development environment below before building the app.

See [Expo development builds](https://docs.expo.dev/develop/development-builds/create-a-build/) and the [SDK 58 upgrade notes](sdk-58-upgrade.md).

## 2. Connect the app to development services

Keep `.env.local` in the repository root. [Git ignore rules](../.gitignore) exclude local environment files. These examples use placeholders.

```dotenv
CONVEX_DEPLOYMENT=dev:your-deployment
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_example
```

| Variable | Used by | Purpose |
| --- | --- | --- |
| `CONVEX_DEPLOYMENT` | Convex CLI | Selects the development deployment. |
| `EXPO_PUBLIC_CONVEX_URL` | App | URL for Convex queries, mutations, and actions. |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | App | Selects the Clerk instance for sign-in. |
| `EXPO_PUBLIC_CONVEX_SITE_URL` | App, optional | Explicit HTTP endpoint base for photo uploads. The app derives `.convex.site` from a standard `.convex.cloud` URL when omitted. |
| `EXPO_PUBLIC_PRIVACY_URL` | App, optional | HTTPS privacy-policy link in the privacy modal. |
| `EXPO_PUBLIC_SUPPORT_URL` | App, optional | HTTPS support link in the menu. |

Expo embeds `EXPO_PUBLIC_*` values in the app bundle. Set the intended pair of Convex and Clerk values before bundling each build. [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)

## 3. Set backend variables in Convex

Use the selected deployment’s dashboard or the Convex CLI. Store these values on the Convex deployment.

| Variable | Required for |
| --- | --- |
| `CLERK_JWT_ISSUER` | Convex to verify tokens from the same Clerk instance that supplied the publishable key. |
| `CLERK_WEBHOOK_SECRET` | Verification of account lifecycle events sent to `/clerk-webhook`. |
| `CLERK_SECRET_KEY` | Server-side account deletion through the Clerk Backend API. |
| `CONVEX_OPENAI_API_KEY` or `OPENAI_API_KEY` | Model calls. The Convex-prefixed variable takes precedence when set. |
| `CONVEX_OPENAI_MODEL` | Optional model override. The fallback name lives in [constants/app.ts](../constants/app.ts). |

In the selected Clerk instance, enable Apple and Google and configure the `convex` JWT template. Point its `user.created` and `user.deleted` webhook events to `https://your-deployment.convex.site/clerk-webhook`. The webhook signing secret must match the corresponding endpoint configuration. [Convex Clerk integration](https://docs.convex.dev/auth/clerk) · [Clerk Expo social connections](https://clerk.com/docs/expo/guides/configure/auth-strategies/social-connections/overview)

## 4. Sync the backend and launch

Push to your selected development backend, then build the iOS app.

```sh
npx convex dev --once
npx expo run:ios
```

Use `npx expo run:ios --device` to select a connected device. With the matching development build already installed, use `npx expo start --dev-client` for JavaScript-only changes.

| Command | Effect |
| --- | --- |
| `npx convex dev` | Pushes functions and schema to the selected development deployment and watches for backend changes. |
| `npx convex dev --once` | Pushes once and exits. |
| `npx expo run:ios` | Builds the native development app, installs it, and starts Metro. |
| `npx expo start --dev-client --clear` | Starts Metro with a fresh transform cache for an installed development build. |
| `npm test` | Runs the repository’s synthetic tests. |
| `npx expo export --platform ios` | Bundles the app to verify JavaScript and assets. Native testing is covered in the [test matrix](testing.md#device-smoke-tests). |

A new backend function will be available to the app after the deployment has received it. Type references in `convex/_generated/` are produced by Convex. Regenerate them after function changes.

## Working on native code

Track native app settings in [app.json](../app.json) and the checked-in [iOS project](../ios/ZWAG.xcodeproj/project.pbxproj). Review the native diff after any prebuild. The checked-in native files are used by Xcode and EAS. A rebuild is required for changes to the native module, permissions, or linked libraries.
