import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// 📁 Paths
const UPLOADS_DIR = path.join(process.cwd(), "uploads/home/banner"); 
const DATA_DIR = path.join(process.cwd(), "data/home"); 
const BANNERS_JSON = path.join(DATA_DIR, "banner.json");

// ✅ Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ✅ Ensure data/home folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ✅ Ensure banner.json exists
if (!fs.existsSync(BANNERS_JSON)) {
  fs.writeFileSync(BANNERS_JSON, JSON.stringify([]));
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

// 📌 Upload banner
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const bannerData = {
    id: Date.now(),
    fileName: req.file.filename,
    url: `http://localhost:5000/uploads/home/banner/${req.file.filename}`,
  };

  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(BANNERS_JSON, "utf-8"));
  } catch {}

  existing.push(bannerData);
  fs.writeFileSync(BANNERS_JSON, JSON.stringify(existing, null, 2));

  res.json(bannerData);
});

// 📌 Get all banners
router.get("/", (req, res) => {
  let banners = [];
  try {
    banners = JSON.parse(fs.readFileSync(BANNERS_JSON, "utf-8"));
  } catch {}
  res.json(banners);
});

// 📌 Delete banner by filename
router.delete("/:filename", (req, res) => {
  const { filename } = req.params;
  let banners = JSON.parse(fs.readFileSync(BANNERS_JSON, "utf-8"));

  banners = banners.filter((b) => b.fileName !== filename);
  fs.writeFileSync(BANNERS_JSON, JSON.stringify(banners, null, 2));

  fs.unlink(path.join(UPLOADS_DIR, filename), (err) => {
    if (err) return res.status(500).json({ error: "Error deleting file" });
    res.json({ success: true, message: "Banner deleted successfully" });
  });
});

export default router;
