/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as generateOutfits from "../generateOutfits.js";
import type * as http from "../http.js";
import type * as inviteCodes from "../inviteCodes.js";
import type * as items from "../items.js";
import type * as outfitHistory from "../outfitHistory.js";
import type * as outfitValidators from "../outfitValidators.js";
import type * as outfits from "../outfits.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  generateOutfits: typeof generateOutfits;
  http: typeof http;
  inviteCodes: typeof inviteCodes;
  items: typeof items;
  outfitHistory: typeof outfitHistory;
  outfitValidators: typeof outfitValidators;
  outfits: typeof outfits;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
