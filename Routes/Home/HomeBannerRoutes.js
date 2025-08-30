import express from "express";
import multer from "multer";
import cloudinary from "../../Utils/cloudinary.js";
import Home from "../../Models/Home.js";

const router = express.Router();

// ✅ Multer (no disk, directly to Cloudinary)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// ✅ Ensure a single Home document exists
const getHomeDoc = async () => {
  let home = await Home.findOne();
  if (!home) home = await Home.create({});
  return home;
};

// 📌 Upload banner
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "home/banner",
    });

    const home = await getHomeDoc();
    const bannerData = {
      _id: Date.now().toString(), // custom ID for delete
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };

    home.banner.push(bannerData);
    await home.save();

    res.json(bannerData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get all banners
router.get("/", async (req, res) => {
  try {
    const home = await getHomeDoc();
    res.json(home.banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete banner
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const home = await getHomeDoc();

    const banner = home.banner.find((b) => b._id === id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(banner.publicId);

    // Remove from MongoDB
    home.banner = home.banner.filter((b) => b._id !== id);
    await home.save();

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
