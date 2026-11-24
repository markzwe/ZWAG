# iOS release runbook

Zwag can be archived and uploaded from Xcode. The native workspace is [ios/ZWAG.xcworkspace](../ios/ZWAG.xcworkspace). EAS is an optional build service. Uploading a TestFlight build creates a beta in App Store Connect. Public App Store submission is a separate operation.

## 1. Choose the environment

| Scenario | Backend and identity |
| --- | --- |
| Local development | Convex development with a matching Clerk development instance. |
| Small internal beta | Use the intended test pair if it is stable and separated from sensitive data. A signed iOS binary can use development backends. |
| Wider beta | Prefer a stable beta or production Convex deployment and the matching Clerk configuration. Verify Apple and Google sign-in with the distributed bundle. |

The app bundles `EXPO_PUBLIC_CONVEX_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. The Clerk key, Convex token issuer, webhook secret, and Clerk server key must refer to the intended environment. Put OpenAI and Clerk secrets on Convex. See the [environment reference](development.md#2-connect-the-app-to-development-services).

A fresh Convex deployment has its own data. A different Clerk instance has its own identities. Plan any account or data migration explicitly before switching an installed beta to a new pair. For a Convex production deployment, review the target before using `npx convex deploy`. [Convex deploy](https://docs.convex.dev/cli/reference/deploy) · [Clerk Expo production setup](https://clerk.com/docs/guides/development/deployment/expo)

## 2. Prepare the build

- [ ] Run the [automated checks](testing.md#automated-checks) and smoke-test the intended backend with a disposable account.
- [ ] Verify the latest Convex schema and functions on that deployment. Confirm sign-in, consent, model access, file upload, and the Clerk deletion webhook.
- [ ] Use an active Apple Developer Program membership and an App Store Connect app record matching the bundle ID on the Xcode target. Verify the distribution signing team and unique build number.
- [ ] Confirm the archive uses a toolchain accepted by App Store Connect. Check the current SDK requirement before each distribution run.
- [ ] Inspect the bundled privacy manifests and generate the archive’s privacy report from Xcode Organizer when reviewing data disclosures. Record any SDK gaps for follow-up.
- [ ] Run the [device smoke tests](testing.md#device-smoke-tests) with the release configuration to cover physical camera, on-device Vision, and OAuth redirects.

[Apple upload requirements](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/) · [Upcoming SDK requirements](https://developer.apple.com/news/upcoming-requirements/)

## 3. Archive and upload from Xcode

1. Make the intended Expo public variables available to the local build. A Metro export using the same configuration is a useful early check.
2. Open `ios/ZWAG.xcworkspace`, select the **ZWAG** scheme and a generic iOS device destination, then choose **Product → Archive**.
3. In Organizer, inspect the archive and choose **Distribute App** when ready. Use **TestFlight Internal Only** for a build you intend to restrict to internal groups. Use the regular **App Store Connect** distribution path if you want the same upload eligible for external TestFlight.
4. Wait for Apple to process the build. In App Store Connect, answer the build’s export compliance prompts where required, complete its beta information, and assign it to a tester group.
5. Install through TestFlight and rerun the smoke tests before expanding the group.

Internal testers are eligible App Store Connect users. An external tester group can include people outside the team, and the first external beta build requires TestFlight App Review. [Apple’s Xcode distribution guide](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases) · [Apple TestFlight](https://developer.apple.com/testflight/)

## Optional EAS build

[eas.json](../eas.json) defines a store build under the `production` profile. It uses the EAS `production` environment and the `sdk-58` iOS image. Configure the public application variables on EAS for that route. The public variable values select the Convex and Clerk instances.

```sh
eas build --platform ios --profile production
```

The command builds an artifact. Submission is a separate action. Use the [Expo iOS build guide](https://docs.expo.dev/tutorial/eas/ios-production-build/) and [EAS build images](https://docs.expo.dev/build-reference/infrastructure/) for current service details.

## After distribution

Record the version and build number, source revision, backend environment, signing team, and smoke-test results. Triage issues with the affected build number, iOS version, and Convex request ID when available. If a build should stop reaching testers, expire it in App Store Connect and issue a corrected build. Verify backend compatibility with the previous distributed client before deploying a breaking API or schema change.

## Data migrations

`users:clearLegacyMeasurements` can report old profile fields before removing them. Start on development.

```sh
npx convex run users:clearLegacyMeasurements '{"cursor":null,"dryRun":true}'
```

Follow each `continueCursor` while `isDone` is false. Verify the target deployment and review the effects before any non-dry run. A real execution removes the legacy measurement fields from the selected page. Remove fields from the schema only after deployed records and retained app versions are compatible.
