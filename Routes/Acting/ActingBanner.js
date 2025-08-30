import express from "express";
import { Banner } from "../../Model/Acting/ActingBanner.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // store in memory

// Upload banner (store image in MongoDB as Base64)
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const base64 = req.file.buffer.toString("base64");
    const banner = new Banner({
      url: `data:${req.file.mimetype};base64,${base64}`,
      title: req.body.title || "Untitled",
    });

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all banners
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete banner
router.delete("/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    await banner.remove();
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
