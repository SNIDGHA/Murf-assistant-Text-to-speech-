import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get TTS requests for a user
export const getTTSRequests = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    return await ctx.db
      .query("ttsRequests")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

// Mutation to create a new TTS request
export const createTTSRequest = mutation({
  args: {
    text: v.string(),
    userId: v.optional(v.string()),
    voice: v.optional(v.string()),
    speed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("ttsRequests", {
      text: args.text,
      userId: args.userId,
      status: "completed", // For now, mark as completed since we're using browser TTS
      voice: args.voice || "alloy",
      speed: args.speed || 1.0,
    });

    return requestId;
  },
});

// Internal query to get a specific TTS request
export const getTTSRequest = query({
  args: { requestId: v.id("ttsRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

// Mutation to update TTS status
export const updateTTSStatus = mutation({
  args: {
    requestId: v.id("ttsRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error")
    ),
    audioUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: args.status,
      ...(args.audioUrl && { audioUrl: args.audioUrl }),
      ...(args.errorMessage && { errorMessage: args.errorMessage }),
    });
  },
});

// Mutation to manage user sessions (for WebSocket-like functionality)
export const updateSession = mutation({
  args: {
    userId: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return;

    const existingSession = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingSession) {
      await ctx.db.patch(existingSession._id, {
        isActive: args.isActive,
        lastActivity: Date.now(),
      });
    } else {
      await ctx.db.insert("sessions", {
        userId: args.userId,
        isActive: args.isActive,
        lastActivity: Date.now(),
      });
    }
  },
});