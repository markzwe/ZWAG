# Zwag developer handbook

Zwag is an iPhone-first digital closet. Users add clothing photos, ask for outfit ideas in chat, and save outfits made from their own closet. Apple or Google sign-in opens the Closet. Chat uses OpenAI after the user grants permission.

This handbook describes the current repository. Tables and diagrams link to the code that owns each behavior. [Expo SDK 58 upgrade](sdk-58-upgrade.md) records a previous migration.

## Start here

| I want to… | Read |
| --- | --- |
| Set up the project and run it on an iPhone | [Development setup](development.md) |
| Understand how the phone, Convex, Clerk, and OpenAI fit together | [Architecture and repository map](architecture.md) |
| See exactly which functions call which | [Code walkthrough](code-walkthrough.md) |
| Trace sign-in and account setup | [Onboarding and authentication](onboarding-flow.md) |
| Trace a clothing photo from the camera to storage | [Closet and image uploads](closet.md) |
| Understand the two model stages, outfit validation, and fallback | [Outfit generation](outfit-generation.md) |
| Look up a Convex table, API, or identifier | [Data model and API reference](backend-reference.md) |
| Understand consent, data sharing, and account deletion | [Privacy and account deletion](privacy.md) |
| Verify a change or diagnose a failure | [Testing and troubleshooting](testing.md) |
| Prepare a TestFlight build from Xcode | [iOS release runbook](release-readiness.md) |

## The three main flows

| Flow | Entry point | Result |
| --- | --- | --- |
| Open the app | [Root route](../app/index.tsx) | Clerk session and Convex account status route the user to Welcome, account status, or Closet. |
| Add a garment | [Photo picker](../app/screens/closet/addItem.tsx) | A photo becomes a storage object and a user-owned item record. |
| Ask for an outfit | [Chat screen](../app/%28tabs%29/chat.tsx) | Zwag replies with text and, when requested and available, a validated outfit card. |

When changing a workflow, update its page and any related API or test entry. Link to source files and use function names that can be searched in the repository.
