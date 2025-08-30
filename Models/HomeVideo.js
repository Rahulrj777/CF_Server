import mongoose from "mongoose";

const HomeVideoSchema = new mongoose.Schema({
  video: { type: String, required: true } // local file path or cloud URL
}, { timestamps: true });

export default mongoose.model("HomeVideo", HomeVideoSchema);
