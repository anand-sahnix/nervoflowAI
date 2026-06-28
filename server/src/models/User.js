import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.virtual("id").get(function getId() {
  return this._id.toString();
});

userSchema.set("toJSON", { virtuals: true, versionKey: false });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
