/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as auditValidators from "../auditValidators.js";
import type * as claims from "../claims.js";
import type * as entitlements from "../entitlements.js";
import type * as evidence from "../evidence.js";
import type * as investigations from "../investigations.js";
import type * as lib_auditPolicy from "../lib/auditPolicy.js";
import type * as lib_claimSuggestions from "../lib/claimSuggestions.js";
import type * as lib_execution from "../lib/execution.js";
import type * as lib_research from "../lib/research.js";
import type * as lib_session from "../lib/session.js";
import type * as lib_subscription from "../lib/subscription.js";
import type * as rooms from "../rooms.js";
import type * as sessions from "../sessions.js";
import type * as votes from "../votes.js";
import type * as workflowDispatch from "../workflowDispatch.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  auditValidators: typeof auditValidators;
  claims: typeof claims;
  entitlements: typeof entitlements;
  evidence: typeof evidence;
  investigations: typeof investigations;
  "lib/auditPolicy": typeof lib_auditPolicy;
  "lib/claimSuggestions": typeof lib_claimSuggestions;
  "lib/execution": typeof lib_execution;
  "lib/research": typeof lib_research;
  "lib/session": typeof lib_session;
  "lib/subscription": typeof lib_subscription;
  rooms: typeof rooms;
  sessions: typeof sessions;
  votes: typeof votes;
  workflowDispatch: typeof workflowDispatch;
  workflows: typeof workflows;
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

export declare const components: {
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
};
