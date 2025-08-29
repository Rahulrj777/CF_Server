import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = express.Router();

const DATA_DIR = path.join(process.cwd(), "data/direction");
const DIPLOMA_JSON = path.join(DATA_DIR, "diploma.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads/direction/diploma");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer setup for PDF upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// GET diploma data
router.post("/update", (req, res) => {
  const { semester1, semester2, pdf } = req.body;
  const newData = {
    semester1: semester1 || [],
    semester2: semester2 || [],
    pdf: pdf || [],
  };
  fs.writeFileSync(DIPLOMA_JSON, JSON.stringify(newData, null, 2));
  res.json({ message: "Updated", data: newData });
});

// GET diploma data
router.get("/", (req, res) => {
  let data = { semester1: [], semester2: [], pdf: [] };
  if (fs.existsSync(DIPLOMA_JSON)) {
    data = JSON.parse(fs.readFileSync(DIPLOMA_JSON, "utf-8"));
  }
  // ensure arrays
  data.semester1 = Array.isArray(data.semester1) ? data.semester1 : [data.semester1];
  data.semester2 = Array.isArray(data.semester2) ? data.semester2 : [data.semester2];
  data.pdf = Array.isArray(data.pdf) ? data.pdf : [data.pdf];
  res.json(data);
});

// POST new data (append)
router.post("/", upload.single("pdf"), (req, res) => {
  let existingData = { semester1: [], semester2: [], pdf: [] };
  if (fs.existsSync(DIPLOMA_JSON)) {
    existingData = JSON.parse(fs.readFileSync(DIPLOMA_JSON, "utf-8"));
  }

  const { semester1 = [], semester2 = [] } = req.body;

  // Convert to array if string
  const sem1Arr = Array.isArray(semester1) ? semester1 : [semester1];
  const sem2Arr = Array.isArray(semester2) ? semester2 : [semester2];

  // Append new data
  existingData.semester1.push(...sem1Arr);
  existingData.semester2.push(...sem2Arr);

  if (req.file) {
    existingData.pdf.push("/uploads/direction/diploma/" + req.file.filename);
  }

  fs.writeFileSync(DIPLOMA_JSON, JSON.stringify(existingData, null, 2));

  res.json({ message: "Diploma updated", data: existingData });
});

// DELETE PDF
router.delete("/pdf", (req, res) => {
  const { file } = req.body; // file path from frontend
  if (!file || !fs.existsSync(path.join(process.cwd(), file))) {
    return res.status(400).json({ message: "File not found" });
  }

  fs.unlinkSync(path.join(process.cwd(), file));

  // Update JSON
  const data = JSON.parse(fs.readFileSync(DIPLOMA_JSON, "utf-8"));
  data.pdf = data.pdf.filter((p) => p !== file);
  fs.writeFileSync(DIPLOMA_JSON, JSON.stringify(data, null, 2));

  res.json({ message: "PDF deleted", data });
});

export default router;
