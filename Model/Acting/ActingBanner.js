import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, default: "Untitled" },
  createdAt: { type: Date, default: Date.now },
});

export const Banner = mongoose.model("Banner", bannerSchema);
