import express from "express";
import { Banner } from "../../Model/Acting/ActingBanner.js";

const router = express.Router();

// 📌 Upload banner (store locally in MongoDB)
router.post("/upload", async (req, res) => {
  try {
    const { url, title } = req.body; // front-end sends the image URL or path
    if (!url) return res.status(400).json({ error: "No image URL provided" });

    const banner = new Banner({
      url,
      title: title || "Untitled",
    });

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get all banners
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete banner (MongoDB only)
router.delete("/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    await Banner.deleteOne({ _id: banner._id });

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
