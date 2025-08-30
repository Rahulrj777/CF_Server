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

// 📌 Get all mentors
router.get("/", async (req, res) => {
  try {
    const home = await getHomeDoc();
    res.json(home.mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Upload mentor image
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "home/mentors",
    });

    // Save in MongoDB
    const home = await getHomeDoc();
    const newMentor = {
      _id: Date.now().toString(),
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };

    home.mentors.push(newMentor);
    await home.save();

    res.json(newMentor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete mentor
router.delete("/:id", async (req, res) => {
  try {
    const home = await getHomeDoc();
    const mentor = home.mentors.find((m) => m._id === req.params.id);

    if (!mentor) return res.status(404).json({ error: "Mentor not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(mentor.publicId);

    // Remove from MongoDB
    home.mentors = home.mentors.filter((m) => m._id !== req.params.id);
    await home.save();

    res.json({ success: true, message: "Mentor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
