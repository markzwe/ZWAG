/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accountDeletion from "../accountDeletion.js";
import type * as generateOutfits from "../generateOutfits.js";
import type * as http from "../http.js";
import type * as items from "../items.js";
import type * as outfitDataValidators from "../outfitDataValidators.js";
import type * as outfitHistory from "../outfitHistory.js";
import type * as outfits from "../outfits.js";
import type * as stylistChat from "../stylistChat.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accountDeletion: typeof accountDeletion;
  generateOutfits: typeof generateOutfits;
  http: typeof http;
  items: typeof items;
  outfitDataValidators: typeof outfitDataValidators;
  outfitHistory: typeof outfitHistory;
  outfits: typeof outfits;
  stylistChat: typeof stylistChat;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
