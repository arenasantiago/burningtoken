import { query } from "./_generated/server";
import { v } from "convex/values";
import { sessionUserId } from "./lib/session";
export const identify = query({ args: { token: v.string() }, handler: async (_ctx, { token }) => ({ userId: await sessionUserId(token) }) });
