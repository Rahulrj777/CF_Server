import express from "express";
import multer from "multer";
import cloudinary from "../../Utils/cloudinary.js";
import Home from "../../Models/Home.js";

const router = express.Router();

// ✅ Multer (keep in memory)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// ✅ Ensure Home doc exists
const getHomeDoc = async () => {
  let home = await Home.findOne();
  if (!home) home = await Home.create({});
  return home;
};

// 📌 Get all filmography items
router.get("/", async (req, res) => {
  try {
    const home = await getHomeDoc();
    res.json(home.filmography);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Upload new filmography image
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "home/filmography",
    });

    // Save in MongoDB
    const home = await getHomeDoc();
    const newItem = {
      _id: Date.now().toString(),
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };

    home.filmography.push(newItem);
    await home.save();

    res.status(201).json({ message: "Uploaded successfully", item: newItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete filmography item
router.delete("/:id", async (req, res) => {
  try {
    const home = await getHomeDoc();
    const item = home.filmography.find((f) => f._id === req.params.id);

    if (!item) return res.status(404).json({ message: "Not found" });

    // Remove from Cloudinary
    await cloudinary.uploader.destroy(item.publicId);

    // Remove from MongoDB
    home.filmography = home.filmography.filter((f) => f._id !== req.params.id);
    await home.save();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
