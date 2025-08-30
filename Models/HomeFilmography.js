import mongoose from "mongoose";

const HomeFilmographySchema = new mongoose.Schema({
  image: { type: String, required: true } // only image
}, { timestamps: true });

export default mongoose.model("HomeFilmography", HomeFilmographySchema);
