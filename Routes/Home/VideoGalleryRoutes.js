import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

const VIDEO_DIR = path.join(process.cwd(), "uploads/home/videos");
const VIDEOS_JSON = path.join(process.cwd(), "data/home/videos.json");

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEOS_JSON)) fs.writeFileSync(VIDEOS_JSON, JSON.stringify([]));

// Multer config for videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEO_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are allowed!"), false);
  },
});

// Upload video
router.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No video uploaded" });

  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const videoData = {
    title: title.trim(),
    fileName: req.file.filename,
    url: `http://localhost:5000/uploads/home/videos/${req.file.filename}`,
  };

  const existing = JSON.parse(fs.readFileSync(VIDEOS_JSON, "utf-8"));
  existing.push(videoData);
  fs.writeFileSync(VIDEOS_JSON, JSON.stringify(existing, null, 2));

  res.json(videoData);
});

// Get videos
router.get("/", (req, res) => {
  const videos = JSON.parse(fs.readFileSync(VIDEOS_JSON, "utf-8"));
  res.json(videos);
});

// Delete video
router.delete("/:filename", (req, res) => {
  const { filename } = req.params;
  let videos = JSON.parse(fs.readFileSync(VIDEOS_JSON, "utf-8"));
  videos = videos.filter((v) => v.fileName !== filename);
  fs.writeFileSync(VIDEOS_JSON, JSON.stringify(videos, null, 2));

  fs.unlink(path.join(VIDEO_DIR, filename), (err) => {
    if (err) return res.status(500).json({ error: "Error deleting file" });
    res.json({ success: true, message: "Video deleted successfully" });
  });
});

export default router;
