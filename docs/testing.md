# Testing and troubleshooting

Use automated checks for function and bundle regressions. Use a physical iPhone for native behavior, and a disposable account on the intended beta backend for destructive tests.

## Automated checks

```sh
npm test
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo export --platform ios --output-dir /tmp/zwag-ios-export
```

| Regression suite | Coverage |
| --- | --- |
| [access-and-deletion.test.cjs](../scripts/access-and-deletion.test.cjs) | Profile provisioning without an invite, account scoping, and deletion cleanup |
| [stylist-chat.test.cjs](../scripts/stylist-chat.test.cjs) | Advice vs. outfit intent, follow-ups, malformed model output, consent and quota request guards, provider failures |
| [outfit-generation.test.cjs](../scripts/outfit-generation.test.cjs) | Candidate selection, validation, retries, fallback, repeat prevention, ownership, and feedback |
| [metro-symbolication.test.cjs](../scripts/metro-symbolication.test.cjs) | Mapping backend frames to local source without replacing unrelated frames |

The unit tests use synthetic fixtures and mock model/provider responses. A Metro export confirms bundling. A successful Xcode archive confirms native compile and packaging for that configuration. Keep existing lint or strict type-check findings separate from regressions introduced by your change.

## Device smoke tests

| Area | Test | Expected |
| --- | --- | --- |
| Fresh launch | Install the current build and open it signed out | Welcome appears without a crash. |
| OAuth | Use a fresh account for Apple and another for Google | Each flow returns to the app and opens Closet after profile setup. |
| Isolation | Add a garment under account A, sign out and sign in as B | B sees only its own closet and transcript. |
| Permissions | Deny camera, then pick from the photo library | Denial explains the alternatives. Photo picking still works. |
| Vision | Select a full-resolution clothing photo, then test the original-photo option after an inference failure | A successful mask opens the details form. The fallback can save the original. |
| Upload | Try saving on a bad connection, then retry | Error is visible. The retry can create an item. Verify the photo and metadata in Closet. |
| Consent | Choose **Not now**, return to chat, allow, then revoke | Closet works after declining. Chat opens after acceptance and shows the consent gate again after revocation. |
| Chat | Ask one general fashion question and one outfit question | The first returns text. The second shows a complete card when eligible clothes are available. |
| History and Fits | Ask for another option and save it | The same combination is excluded. The saved outfit appears in Fits. |
| Restore | Quit, relaunch, and revisit chat with the same account | The transcript and occasion restore from local storage. |
| Sparse closet | Ask for an outfit from an empty closet | Chat explains what is needed. |
| Deletion | Delete a disposable account with a saved outfit and photo | Account status changes, the local chat clears, and the scheduled job removes its Convex records and Clerk identity. |
| Accessibility | Go through the main flows with VoiceOver and larger text | Core controls are labeled and remain reachable. |

Use both your oldest supported target OS and a recent iPhone configuration when feasible. The target supports iOS 16.4, while background removal is gated at iOS 17.

## Troubleshooting by symptom

| Symptom | Check first |
| --- | --- |
| Protected functions stay signed out or account setup stalls | Confirm the installed app’s Clerk key and Convex URL point to the intended pair. Verify the `convex` JWT template and `CLERK_JWT_ISSUER`. Inspect the Clerk webhook's event deliveries separately from the app’s fallback provisioning. |
| Convex reports a missing function or schema export | Compare the reported function path to the deployed functions. Check that schema imports match exported validators, regenerate Convex types, and sync the intended deployment. |
| Metro reports a missing `async-require.js` after upgrading Expo | Stop the earlier Metro server, start with `npx expo start --dev-client --clear`, and use the matching native development build. See [SDK 58 upgrade notes](sdk-58-upgrade.md). |
| `AsyncStorage` native module is null or Hermes reports a startup syntax error after a dependency change | Rebuild and reinstall the development client with `npx expo run:ios` so native modules and Hermes match the JavaScript bundle. Restart Metro if stale. |
| Xcode tools or simulator cannot be found | Confirm the active Xcode installation with `xcode-select -p` and check for an installed simulator runtime in Xcode. |
| `simctl openurl` times out on the dev-client link | Check that the intended device has booted, the matching Zwag development app is installed and can be opened, and Metro is reachable from that target. |
| Photo removal stalls or reports an inference error | Retry on an iOS 17+ physical device or choose **Use Original Photo**. Compare the result with a simple foreground image. |
| Photo save fails after picking successfully | Check the Convex HTTP base URL, bearer token, active profile, PNG or JPEG type, and 10 MiB limit. A site URL and a Convex client URL serve different endpoints. |
| Chat reports credits, access, or model errors | Check the OpenAI project balance, server key, model availability, and deployed environment. The first-stage chat action must succeed before the outfit fallback can help. |
| A saved outfit is missing an old garment | Check whether the source item was deleted or changed. Saved outfit rows keep garment IDs. |
| Deletion remains pending or fails | Check the scheduled worker, the matching Clerk secret, and the signed webhook delivery. The account-status screen offers retry. |

Start with the app’s error text and the exact environment. Compare timestamps with Convex logs. Capture the request ID, build number, and device OS. Keep tokens, raw chat messages, and real wardrobe data out of bug reports.
