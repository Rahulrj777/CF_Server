// routes/diplomaRoutes.js
import express from "express"
import fs from "fs"
import path from "path"
import multer from "multer"

const router = express.Router()

const MENTOR_DIR = path.join(process.cwd(), "uploads/virtualproduction/diploma")
const DATA_DIR = path.join(process.cwd(), "data/virtualproduction")
const MENTORS_JSON = path.join(DATA_DIR, "diploma.json")

// ensure dirs
if (!fs.existsSync(MENTOR_DIR)) fs.mkdirSync(MENTOR_DIR, { recursive: true })
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MENTOR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const fname = Date.now() + "-" + file.originalname.replace(/\s+/g, "_")
    cb(null, fname)
  },
})
const upload = multer({ storage })

// Helper: read JSON
const readData = () => {
  try {
    if (!fs.existsSync(MENTORS_JSON)) return []
    const raw = fs.readFileSync(MENTORS_JSON, "utf-8")
    if (!raw?.trim()) return []
    return JSON.parse(raw)
  } catch (e) {
    console.error("[v0] Failed to read/parse diploma JSON:", e)
    return []
  }
}

// Helper: write JSON
const writeData = (arr) => {
  fs.writeFileSync(MENTORS_JSON, JSON.stringify(arr, null, 2))
}

// GET all courses
router.get("/", (req, res) => {
  const data = readData()
  res.json(data)
})

// ADD course
router.post("/", upload.single("image"), (req, res) => {
  const { courseTitle, timeline, detailTitle, description, link } = req.body
  if (!req.file) return res.status(400).json({ message: "Image required" })

  const data = readData()
  const newItem = {
    id: Date.now().toString(),
    image: `/uploads/virtualproduction/diploma/${req.file.filename}`,
    courseTitle,
    timeline,
    detailTitle,
    description,
    link,
  }
  data.push(newItem)
  writeData(data)
  res.status(201).json(newItem)
})

// UPDATE course
router.put("/:id", upload.single("image"), (req, res) => {
  const { id } = req.params
  const data = readData()
  const idx = data.findIndex((c) => String(c.id) === String(id))
  if (idx === -1) return res.status(404).json({ message: "Not found" })

  const course = data[idx]
  const { courseTitle, timeline, detailTitle, description, link } = req.body

  if (req.file) {
    // delete old image
    if (course.image) {
      const relOld = course.image.startsWith("/") ? course.image.slice(1) : course.image
      const oldPath = path.join(process.cwd(), relOld)
      try {
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      } catch (e) {
        console.warn("[v0] Could not delete old image:", oldPath, e?.message)
      }
    }
    course.image = `/uploads/virtualproduction/diploma/${req.file.filename}`
  }

  course.courseTitle = courseTitle ?? course.courseTitle
  course.timeline = timeline ?? course.timeline
  course.detailTitle = detailTitle ?? course.detailTitle
  course.description = description ?? course.description
  course.link = link ?? course.link

  data[idx] = course
  writeData(data)
  res.json(course)
})

// DELETE course
router.delete("/:id", (req, res) => {
  const { id } = req.params
  let data = readData()
  const idx = data.findIndex((c) => String(c.id) === String(id))
  if (idx === -1) return res.status(404).json({ message: "Not found" })

  const course = data[idx]
  if (course.image) {
    const rel = course.image.startsWith("/") ? course.image.slice(1) : course.image
    const filePath = path.join(process.cwd(), rel)
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch (e) {
      console.warn("[v0] Could not delete image:", filePath, e?.message)
    }
  }

  data = data.filter((c) => String(c.id) !== String(id))
  writeData(data)
  res.json({ message: "Deleted" })
})

export default router
