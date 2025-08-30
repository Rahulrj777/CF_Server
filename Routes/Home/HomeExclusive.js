import express from "express";
import multer from "multer";
import cloudinary from "../../Utils/cloudinary.js";
import Home from "../../Models/Home.js";

const router = express.Router();

// ✅ Multer (store in memory, not local disk)
const storage = multer.diskStorage({});
const upload = multer({ storage });

// ✅ Ensure a single Home doc exists
const getHomeDoc = async () => {
  let home = await Home.findOne();
  if (!home) home = await Home.create({});
  return home;
};

// 📌 Get all exclusive items
router.get("/", async (req, res) => {
  try {
    const home = await getHomeDoc();
    res.json(home.exclusive);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Add new exclusive item (image + text)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.body.titleLine) {
      return res.status(400).json({ message: "Image and text required" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "home/exclusive",
    });

    // Save in MongoDB
    const home = await getHomeDoc();
    const newItem = {
      _id: Date.now().toString(), // custom ID for delete
      imageUrl: result.secure_url,
      publicId: result.public_id,
      titleLine: req.body.titleLine,
    };

    home.exclusive.push(newItem);
    await home.save();

    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete exclusive item
router.delete("/:id", async (req, res) => {
  try {
    const home = await getHomeDoc();
    const item = home.exclusive.find((e) => e._id === req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(item.publicId);

    // Remove from MongoDB
    home.exclusive = home.exclusive.filter((e) => e._id !== req.params.id);
    await home.save();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
