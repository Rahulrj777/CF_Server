import express from "express";
import multer from "multer";
import cloudinary from "../../Utils/cloudinary.js";
import Home from "../../Models/Home.js";

const router = express.Router();

// ✅ Multer (in-memory)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// ✅ Ensure Home doc exists
const getHomeDoc = async () => {
  let home = await Home.findOne();
  if (!home) home = await Home.create({});
  return home;
};

// 📌 Get all videos
router.get("/", async (req, res) => {
  try {
    const home = await getHomeDoc();
    res.json(home.videoGallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Upload video
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file || !title || title.trim() === "") {
      return res.status(400).json({ error: "Video file and title are required" });
    }

    // Upload video to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "home/videos",
    });

    // Save in MongoDB
    const home = await getHomeDoc();
    const newVideo = {
      _id: Date.now().toString(),
      videoUrl: result.secure_url,
      publicId: result.public_id,
      title: title.trim(),
    };

    home.videoGallery.push(newVideo);
    await home.save();

    res.json(newVideo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete video
router.delete("/:id", async (req, res) => {
  try {
    const home = await getHomeDoc();
    const video = home.videoGallery.find((v) => v._id === req.params.id);

    if (!video) return res.status(404).json({ error: "Video not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });

    // Remove from MongoDB
    home.videoGallery = home.videoGallery.filter((v) => v._id !== req.params.id);
    await home.save();

    res.json({ success: true, message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
