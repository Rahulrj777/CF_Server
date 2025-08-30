import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// Folder paths
const uploadDir = path.join(process.cwd(), "uploads/cfa/filmography");
const dataFile = path.join(process.cwd(), "data/cfa/filmography.json");

// Ensure directories exist
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(path.dirname(dataFile))) fs.mkdirSync(path.dirname(dataFile), { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify([]));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Get all di items
router.get("/", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error reading filmography data" });
  }
});

// Upload new image
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile));

    const newItem = {
      id: Date.now(),
      image: `/uploads/cfa/filmography/${req.file.filename}`,
    };

    data.push(newItem);
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    res.status(201).json({ message: "Uploaded successfully", item: newItem });
  } catch (error) {
    res.status(500).json({ message: "Error saving filmography data" });
  }
});

// Delete filmography item
router.delete("/:id", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile));
    const item = data.find((d) => d.id === parseInt(req.params.id));

    if (!item) return res.status(404).json({ message: "Not found" });

    // Delete image file
    const filePath = path.join(process.cwd(), item.image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Update JSON
    const updatedData = data.filter((d) => d.id !== parseInt(req.params.id));
    fs.writeFileSync(dataFile, JSON.stringify(updatedData, null, 2));

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting filmography item" });
  }
});

export default router;
