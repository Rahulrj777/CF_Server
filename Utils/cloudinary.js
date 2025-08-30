import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Minimal sanity logs (never print secrets)
console.log("[v0] Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "***set***" : "MISSING",
  has_key: !!process.env.CLOUDINARY_API_KEY,
  has_secret: !!process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary
