import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ttsRequests: defineTable({
    text: v.string(),
    userId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error")
    ),
    audioUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    voice: v.optional(v.string()),
    speed: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  sessions: defineTable({
    userId: v.optional(v.string()),
    isActive: v.boolean(),
    lastActivity: v.number(),
  }).index("by_userId", ["userId"]),
});