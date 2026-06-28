import mongoose from "mongoose";

const workflowRunSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    status: { type: String, default: "queued" },
    title: String,
    input: { type: Object, default: {} },
    output: { type: Object, default: {} },
    citations: { type: [Object], default: [] },
    evaluation: { type: Object, default: {} },
    trace: { type: [Object], default: [] }
  },
  { timestamps: true }
);

workflowRunSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

workflowRunSchema.set("toJSON", { virtuals: true, versionKey: false });

export const WorkflowRun = mongoose.models.WorkflowRun || mongoose.model("WorkflowRun", workflowRunSchema);
