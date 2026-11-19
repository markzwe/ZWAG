# Expo SDK 58 upgrade

ZWAG now uses Expo 58.0.26, React Native 0.88.1, React 19.3.0, and TypeScript
6.0.3. Expo libraries follow the SDK 58 dependency map. Reanimated 4 uses the
matching `react-native-worklets` dependency, and Skia is updated to 2.14.0.

## Running the app

Use Node 22.13+ on the 22 line or Node 24.3+ on the 24 line. Install JavaScript
dependencies with `npm ci`, then run the usual command:

```sh
npx expo run:ios
```

An SDK 53 development binary cannot run the upgraded native modules. Build and
install a new development binary after this upgrade. Keep `npx expo run:ios` as
the normal iOS command; no simulator workaround command is needed.

## Restart Metro after an SDK upgrade

Stop any Metro process that was started before upgrading dependencies, then run:

```sh
npx expo start --dev-client --clear
```

A running server keeps its old Metro configuration in memory. After upgrading
from SDK 53, that can make dynamic imports request the removed
`@expo/metro-config/build/async-require.js` helper. SDK 58 resolves the helper
through `expo/internal/async-require-module`. Restarting with a clean cache fixes
the old configuration; no replacement helper file or Clerk patch is needed.

## Native changes

- iOS uses Expo's scene lifecycle through `ExpoAppSceneDelegate` and the generated
  `SceneDelegate.swift`. The custom SDK 53 lifecycle forwarding is removed.
- SDK 58's CLI supports Xcode 27 Device Hub directly. The old CLI postinstall
  patch and its helper scripts are removed.
- The SDK 58 Podfile uses the supported prebuilt React Native and Expo artifacts.
  The older fmt 11 compiler workaround is removed.
- The app's minimum iOS version is 16.4. Apple Vision background removal still
  requires iOS 17 or later.
- Android native files are regenerated for SDK 58. The local background-removal
  module uses `expo-module-gradle-plugin` instead of the removed Gradle helper.
- App bundle identifiers and the existing Apple signing team are preserved.

The upload screen imports `expo-file-system/legacy`, because its existing
`uploadAsync` operation is a legacy API. The root import now exposes the newer
file API and would throw for that operation.

## Checks and maintenance

`npm test` runs synthetic backend tests without reading wardrobe records or
spending API credits. `npx expo-doctor@latest` checks SDK dependencies and config.
An iOS Metro export verifies that the JavaScript app bundles.

The project commits `ios/` and `android/`. EAS Build uses those checked-in native
projects and does not automatically apply native settings from app.json. This is
an intentional workflow, so `expo.doctor.appConfigFieldsNotSyncedCheck.enabled`
is set to `false` in package.json. Only that advisory is disabled; dependency,
SDK compatibility, and the other Doctor checks stay enabled.

After changing native app config (icons, orientation, URL schemes, permissions,
or plugins), run `npx expo prebuild --no-install`, then install iOS pods if needed,
review the native diff, and commit the native changes along with app.json. Preserve
custom native changes before regenerating projects. Disabling the advisory does
not make EAS synchronize native configuration automatically.

Full-project TypeScript checks also report existing unused-code errors and
`expiresAt: undefined` in `convex/inviteCodes.ts`; these are separate from the SDK
migration. The upgrade corrects the chat list footer type and optional Clerk
provider props required by the updated dependencies.

References:

- https://expo.dev/changelog/sdk-58
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- https://docs.expo.dev/versions/v58.0.0/sdk/filesystem-legacy/

## Verification for this upgrade

- All 32 synthetic tests pass with the updated dependency tree.
- iOS and Android Metro exports complete successfully.
- A Debug build for the iPhone 17 simulator succeeds with Xcode 27.2.
- Expo Doctor runs its remaining checks with the intentional native-project
  synchronization advisory disabled, as documented above.
- Migration-touched screen/provider files have no lint errors. The photo screen
  uses lazy state for its Animated values to comply with the newer React lint rules.

A simulator build does not verify device signing or real-device Vision inference.
Rebuild the development app for your iPhone to verify those device-specific paths.
