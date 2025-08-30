import mongoose from "mongoose";

const HomeMentorSchema = new mongoose.Schema({
  image: { type: String, required: true } // only image
}, { timestamps: true });

export default mongoose.model("HomeMentor", HomeMentorSchema);
