import mongoose from "mongoose";

const HomeBannerSchema = new mongoose.Schema({
  image: { type: String, required: true } // only image path or URL
}, { timestamps: true });

export default mongoose.model("HomeBanner", HomeBannerSchema);
