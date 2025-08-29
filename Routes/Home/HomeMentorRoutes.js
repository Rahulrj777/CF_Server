import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

const MENTOR_DIR = path.join(process.cwd(), "uploads/home/mentors"); // images
const DATA_DIR = path.join(process.cwd(), "data/home");               // JSON folder
const MENTORS_JSON = path.join(DATA_DIR, "mentors.json"); 

// ✅ Ensure mentors folder exists
if (!fs.existsSync(MENTOR_DIR)) {
  fs.mkdirSync(MENTOR_DIR, { recursive: true });
}

// ✅ Ensure mentors.json exists
if (!fs.existsSync(MENTORS_JSON)) {
  fs.writeFileSync(MENTORS_JSON, JSON.stringify([]));
}

// Multer config for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MENTOR_DIR),
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

// 📌 Upload mentor image
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Mentor name is required" });
  }

  const mentorData = {
    id: Date.now(),
    name: name.trim(),
    fileName: req.file.filename,
    url: `http://localhost:5000/uploads/home/mentors/${req.file.filename}`,
  };

  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(MENTORS_JSON, "utf-8"));
  } catch {
    existing = [];
  }

  existing.push(mentorData);
  fs.writeFileSync(MENTORS_JSON, JSON.stringify(existing, null, 2));

  res.json(mentorData);
});

// 📌 Get all mentors
router.get("/", (req, res) => {
  try {
    const mentors = JSON.parse(fs.readFileSync(MENTORS_JSON, "utf-8"));
    res.json(mentors);
  } catch {
    res.json([]);
  }
});

// 📌 Delete mentor by filename
router.delete("/:filename", (req, res) => {
  const { filename } = req.params;
  let mentors = JSON.parse(fs.readFileSync(MENTORS_JSON, "utf-8"));

  mentors = mentors.filter((m) => m.fileName !== filename);
  fs.writeFileSync(MENTORS_JSON, JSON.stringify(mentors, null, 2));

  fs.unlink(path.join(MENTOR_DIR, filename), (err) => {
    if (err) return res.status(500).json({ error: "Error deleting file" });
    res.json({ success: true, message: "Mentor deleted successfully" });
  });
});

export default router;
