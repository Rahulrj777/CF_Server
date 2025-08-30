import express from "express";
import { getMulterUpload } from "../../Cloudinary/cloudinary.js";
import { Banner } from "../../Model/Acting/ActingBanner.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();
const upload = getMulterUpload("acting/banner"); // folder in Cloudinary

// 📌 Upload banner
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    // Save record in MongoDB
    const banner = new Banner({
      url: req.file.path,          // Cloudinary URL
      public_id: req.file.filename, // Cloudinary public_id
      title: req.body.title || "Untitled",
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

// 📌 Delete banner
router.delete("/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(banner.public_id, { resource_type: "image" });

    // Delete from MongoDB
    await banner.remove();

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
