import mongoose from "mongoose";

const chatThreadSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    title: String
  },
  { timestamps: true }
);

chatThreadSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

chatThreadSchema.set("toJSON", { virtuals: true, versionKey: false });

export const ChatThread = mongoose.models.ChatThread || mongoose.model("ChatThread", chatThreadSchema);
