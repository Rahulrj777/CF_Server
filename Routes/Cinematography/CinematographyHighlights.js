import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// 📁 Paths
const UPLOADS_DIR = path.join(
  process.cwd(),
  "uploads/cinematography/highlight"
);
const DATA_DIR = path.join(process.cwd(), "data/cinematography");
const JSON_FILE = path.join(DATA_DIR, "highlight.json");

// ✅ Ensure folders exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(JSON_FILE)) fs.writeFileSync(JSON_FILE, JSON.stringify([]));

// 📌 Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 📌 Get all highlight items
router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(JSON_FILE));
  res.json(data);
});

// 📌 Add new item (only 1 image + 1 text)
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file || !req.body.titleLine)
    return res.status(400).json({ message: "Image and text required" });

  const newItem = {
    id: Date.now(),
    image: `/uploads/cinematography/highlight/${req.file.filename}`,
    titleLine: req.body.titleLine,
  };

  const data = JSON.parse(fs.readFileSync(JSON_FILE));
  data.push(newItem);
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2));

  res.json(newItem);
});

// 📌 Delete item
router.delete("/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(JSON_FILE));
  const index = data.findIndex((i) => i.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "Item not found" });

  const imgPath = path.join(UPLOADS_DIR, path.basename(data[index].image));
  if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

  data.splice(index, 1);
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2));

  res.json({ message: "Deleted successfully" });
});

export default router;
