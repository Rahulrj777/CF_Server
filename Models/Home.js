import mongoose from "mongoose"

const BannerSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: true, timestamps: true },
)

const HomeSchema = new mongoose.Schema(
  {
    banner: { type: [BannerSchema], default: [] },
  },
  { timestamps: true },
)

// Reuse connection in dev to prevent multiple connections
let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function getDb() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    const uri = process.env.MONGO_URI
    if (!uri) {
      console.log("[v0] MONGO_URI is not set. Database operations will fail.")
    } else {
      console.log("[v0] Connecting to MongoDB...")
    }
    cached.promise = mongoose.connect(uri || "", { dbName: process.env.MONGO_DB || undefined }).then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

const Home = mongoose.models.Home || mongoose.model("Home", HomeSchema)
export default Home
