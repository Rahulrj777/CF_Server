import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 📁 Directories for VFX Diploma
const DATA_DIR = path.join(process.cwd(), "data/vfx");
const DIPLOMA_JSON = path.join(DATA_DIR, "diploma.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads/vfx/diploma");
const PDF_FILE = path.join(UPLOADS_DIR, "syllabus.pdf"); // single PDF

// Ensure folders exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ====================== Multer setup ======================

// Images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const uploadImage = multer({ storage: imageStorage });

// PDF (single)
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, "syllabus.pdf"), // always overwrite
});
const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
  },
});

// ====================== IMAGE ROUTES ======================

const readImages = () => (fs.existsSync(DIPLOMA_JSON) ? JSON.parse(fs.readFileSync(DIPLOMA_JSON)) : []);
const writeImages = (images) => fs.writeFileSync(DIPLOMA_JSON, JSON.stringify(images, null, 2));

router.post("/upload", uploadImage.single("image"), (req, res) => {
  const images = readImages();
  const newImage = {
    id: Date.now().toString(),
    url: `/uploads/vfx/diploma/${req.file.filename}`,
    filename: req.file.filename,
  };
  images.push(newImage);
  writeImages(images);
  res.json(newImage);
});

router.get("/", (req, res) => res.json(readImages()));

router.delete("/:id", (req, res) => {
  const images = readImages();
  const image = images.find((img) => img.id === req.params.id);
  if (!image) return res.status(404).json({ message: "Image not found" });

  const filePath = path.join(UPLOADS_DIR, image.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  writeImages(images.filter((img) => img.id !== req.params.id));
  res.json({ message: "Image deleted" });
});

// ====================== PDF ROUTES ======================

// Upload or replace PDF
router.post("/upload-pdf", uploadPDF.single("pdf"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });

  let data = readImages();

  // Remove any existing PDF object
  data = data.filter((item) => item.type !== "pdf");

  // Add new PDF object
  data.push({ id: "pdf", url: `/uploads/vfx/diploma/syllabus.pdf`, type: "pdf", filename: req.file.filename });

  writeImages(data);

  res.json({ pdf: `/uploads/vfx/diploma/syllabus.pdf` });
});

// Get PDF
router.get("/pdf", (req, res) => {
  if (!fs.existsSync(PDF_FILE)) return res.status(404).json({ message: "PDF not found" });
  res.json({ pdf: `/uploads/vfx/diploma/syllabus.pdf` });
});

// Delete PDF
router.delete("/pdf", (req, res) => {
  if (!fs.existsSync(PDF_FILE)) return res.status(404).json({ message: "PDF not found" });

  try {
    fs.unlinkSync(PDF_FILE);

    // Remove PDF entry from JSON
    if (fs.existsSync(DIPLOMA_JSON)) {
      const data = readImages().filter((item) => item.type !== "pdf");
      writeImages(data);
    }

    res.json({ message: "PDF deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting PDF", error: err.message });
  }
});

export default router;
