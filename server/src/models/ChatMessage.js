import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    threadId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    content: String,
    citations: { type: [Object], default: [] }
  },
  { timestamps: true }
);

chatMessageSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

chatMessageSchema.set("toJSON", { virtuals: true, versionKey: false });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);
