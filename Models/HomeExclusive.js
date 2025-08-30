import mongoose from "mongoose";

const HomeExclusiveSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true } // image with text
}, { timestamps: true });

export default mongoose.model("HomeExclusive", HomeExclusiveSchema);
