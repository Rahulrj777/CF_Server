import express from "express";
import fs from "fs";
import { getMulterUpload } from "../../Cloudinary/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();
const DATA_DIR = "data/acting";
const BANNERS_JSON = `${DATA_DIR}/banner.json`;

// Ensure data folder & JSON exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BANNERS_JSON)) fs.writeFileSync(BANNERS_JSON, JSON.stringify([]));

const upload = getMulterUpload("acting/banner");

// Upload banner
router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const banner = {
    id: Date.now(),
    public_id: req.file.filename, // Cloudinary public_id
    url: req.file.path,           // Cloudinary URL
  };

  const banners = JSON.parse(fs.readFileSync(BANNERS_JSON, "utf-8"));
  banners.push(banner);
  fs.writeFileSync(BANNERS_JSON, JSON.stringify(banners, null, 2));

  res.json(banner);
});

// Get all banners
router.get("/", (req, res) => {
  const banners = JSON.parse(fs.readFileSync(BANNERS_JSON, "utf-8"));
  res.json(banners);
});

// Delete banner
router.delete("/:public_id", async (req, res) => {
  const { public_id } = req.params;
  let banners = JSON.parse(fs.readFileSync(BANNERS_JSON, "utf-8"));
  banners = banners.filter(b => b.public_id !== public_id);
  fs.writeFileSync(BANNERS_JSON, JSON.stringify(banners, null, 2));

  try {
    await cloudinary.uploader.destroy(`acting/banner/${public_id}`, { resource_type: "image" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting file from Cloudinary" });
  }
});

export default router;
