import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import HomeBanner from "../../Models/HomeBanner.js"

const router = express.Router();

// 📁 Paths
const UPLOADS_DIR = path.join(process.cwd(), "uploads/home/banner"); 

// ✅ Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  },
});

// 📌 Upload banner (save file + MongoDB record)
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("File received:", req.file);
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const banner = new HomeBanner({
      image: `http://localhost:5000/uploads/home/banner/${req.file.filename}`
    });

    await banner.save();

    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete banner
router.delete("/:id", async (req, res) => {
  try {
    const banner = await HomeBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    // extract filename from URL
    const filename = banner.image.split("/").pop();

    // Delete file from uploads folder
    fs.unlink(path.join(UPLOADS_DIR, filename), (err) => {
      if (err) console.error("File delete error:", err);
    });

    await HomeBanner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get all banners
router.get("/", async (req, res) => {
  try {
    const banners = await HomeBanner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
