/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentChat from "../agentChat.js";
import type * as agentGeneration from "../agentGeneration.js";
import type * as agentRequests from "../agentRequests.js";
import type * as billing from "../billing.js";
import type * as billingWebhook from "../billingWebhook.js";
import type * as bookmarks from "../bookmarks.js";
import type * as crons from "../crons.js";
import type * as follows from "../follows.js";
import type * as http from "../http.js";
import type * as interactions from "../interactions.js";
import type * as lib_agent from "../lib/agent.js";
import type * as lib_agentAccess from "../lib/agentAccess.js";
import type * as lib_agentContext from "../lib/agentContext.js";
import type * as lib_agentPolicy from "../lib/agentPolicy.js";
import type * as lib_agentQuota from "../lib/agentQuota.js";
import type * as lib_aggregates from "../lib/aggregates.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_billing from "../lib/billing.js";
import type * as lib_content from "../lib/content.js";
import type * as lib_handles from "../lib/handles.js";
import type * as lib_search from "../lib/search.js";
import type * as likes from "../likes.js";
import type * as posts from "../posts.js";
import type * as replies from "../replies.js";
import type * as uploads from "../uploads.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentChat: typeof agentChat;
  agentGeneration: typeof agentGeneration;
  agentRequests: typeof agentRequests;
  billing: typeof billing;
  billingWebhook: typeof billingWebhook;
  bookmarks: typeof bookmarks;
  crons: typeof crons;
  follows: typeof follows;
  http: typeof http;
  interactions: typeof interactions;
  "lib/agent": typeof lib_agent;
  "lib/agentAccess": typeof lib_agentAccess;
  "lib/agentContext": typeof lib_agentContext;
  "lib/agentPolicy": typeof lib_agentPolicy;
  "lib/agentQuota": typeof lib_agentQuota;
  "lib/aggregates": typeof lib_aggregates;
  "lib/auth": typeof lib_auth;
  "lib/billing": typeof lib_billing;
  "lib/content": typeof lib_content;
  "lib/handles": typeof lib_handles;
  "lib/search": typeof lib_search;
  likes: typeof likes;
  posts: typeof posts;
  replies: typeof replies;
  uploads: typeof uploads;
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

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  likeCounts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"likeCounts">;
  followerCounts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"followerCounts">;
  followingCounts: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"followingCounts">;
};
