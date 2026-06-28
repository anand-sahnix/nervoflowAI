import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    documentId: { type: String, required: true, index: true },
    chunkIndex: Number,
    text: String,
    tokenCountApprox: Number,
    embedding: { type: [Number], default: [] },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

documentChunkSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

documentChunkSchema.set("toJSON", { virtuals: true, versionKey: false });

export const DocumentChunk = mongoose.models.DocumentChunk || mongoose.model("DocumentChunk", documentChunkSchema);
