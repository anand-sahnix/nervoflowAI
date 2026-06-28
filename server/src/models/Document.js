import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    originalName: String,
    storedName: String,
    mimeType: String,
    size: Number,
    fileType: String,
    status: { type: String, default: "uploaded" },
    extractedText: { type: String, default: "" },
    summary: { type: String, default: "" },
    pageCount: { type: Number, default: 0 },
    metadata: { type: Object, default: {} },
    processingError: { type: String, default: "" }
  },
  { timestamps: true }
);

documentSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

documentSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);
