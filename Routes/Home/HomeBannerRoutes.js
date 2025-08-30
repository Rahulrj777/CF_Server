import express from "express"
import multer from "multer"
import streamifier from "streamifier"
import cloudinary from "../../Utils/cloudinary.js"
import Home from "../../Models/Home.js"

const router = express.Router()

// Memory storage for multer
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

const getHomeDoc = async () => {
  let home = await Home.findOne()
  if (!home) {
    console.log("[v0] No Home doc found. Creating new...")
    home = await Home.create({})
  }
  return home
}

// List banners
router.get("/", async (req, res) => {
  try {
    console.log("[v0] GET /homebanner")
    const home = await getHomeDoc()
    res.json(home.banner || [])
  } catch (err) {
    console.error("[v0] GET /homebanner error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Upload banner
router.post("/upload", upload.single("image"), async (req, res) => {
  console.log("[v0] POST /homebanner/upload hit")
  console.log("[v0] Headers content-type:", req.headers["content-type"])
  try {
    if (!req.file) {
      console.log("[v0] req.file is undefined")
      return res
        .status(400)
        .json({ error: "No image uploaded. Field name must be 'image' and content-type must be multipart/form-data" })
    }

    console.log("[v0] Received file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    })

    const home = await getHomeDoc()

    const stream = cloudinary.uploader.upload_stream({ folder: "home/banner" }, async (error, result) => {
      if (error) {
        console.error("[v0] Cloudinary upload error:", error)
        return res.status(500).json({ error: error.message || "Cloudinary upload failed" })
      }

      console.log("[v0] Cloudinary result:", {
        public_id: result?.public_id,
        secure_url: result?.secure_url,
        bytes: result?.bytes,
        format: result?.format,
      })

      try {
        // Let Mongoose generate _id (ObjectId)
        const bannerData = {
          imageUrl: result.secure_url,
          publicId: result.public_id,
        }

        home.banner.push(bannerData)
        const saved = await home.save()
        const savedBanner = saved.banner[saved.banner.length - 1]

        console.log("[v0] Saved banner subdoc:", savedBanner?._id?.toString())
        return res.json(savedBanner)
      } catch (dbErr) {
        console.error("[v0] DB save error:", dbErr)
        return res.status(500).json({ error: dbErr.message })
      }
    })

    streamifier.createReadStream(req.file.buffer).pipe(stream)
  } catch (err) {
    console.error("[v0] POST /homebanner/upload error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Delete banner
router.delete("/:id", async (req, res) => {
  const { id } = req.params
  console.log("[v0] DELETE /homebanner/:id", id)
  try {
    const home = await getHomeDoc()

    const banner = home.banner.id(id)
    if (!banner) {
      console.log("[v0] Banner not found for id:", id)
      return res.status(404).json({ error: "Banner not found" })
    }

    if (banner.publicId) {
      console.log("[v0] Destroying Cloudinary asset:", banner.publicId)
      await cloudinary.uploader.destroy(banner.publicId)
    }

    banner.deleteOne()
    await home.save()

    console.log("[v0] Banner deleted:", id)
    res.json({ success: true, message: "Banner deleted successfully" })
  } catch (err) {
    console.error("[v0] DELETE /homebanner/:id error:", err)
    res.status(500).json({ error: err.message })
  }
})

export default router
