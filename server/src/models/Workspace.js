import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    color: { type: String, default: "#2563eb" }
  },
  { timestamps: true }
);

workspaceSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

workspaceSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);
