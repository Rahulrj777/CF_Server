import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"

const router = express.Router()

const DATA_DIR = path.join(process.cwd(), "data/di")
const DATA_FILE = path.join(DATA_DIR, "diploma.json")
const UPLOADS_DIR = path.join(process.cwd(), "uploads/di/diploma")

// ensure dirs exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// Multer setup (only pdf)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true)
    else cb(new Error("Only PDF files allowed"))
  },
})

// 🔹 Read data
const SAFE_DEFAULT = { pdf: null, items: [] }

const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return SAFE_DEFAULT
    const raw = fs.readFileSync(DATA_FILE, "utf-8")
    const parsed = JSON.parse(raw || "{}")
    if (Array.isArray(parsed)) {
      // legacy shape stored an array directly -> treat as items
      return { pdf: null, items: parsed }
    }
    if (parsed && typeof parsed === "object") {
      return {
        pdf: parsed.pdf ?? null,
        items: Array.isArray(parsed.items) ? parsed.items : [],
      }
    }
    return SAFE_DEFAULT
  } catch (e) {
    return SAFE_DEFAULT
  }
}

// 🔹 Write data
const writeData = (data) => {
  // coerce to correct shape before writing
  const normalized = Array.isArray(data)
    ? { pdf: null, items: data }
    : {
        pdf: data && typeof data === "object" && "pdf" in data ? data.pdf : null,
        items: data && typeof data === "object" && Array.isArray(data.items) ? data.items : [],
      }
  fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2))
}

// 📌 Get all
router.get("/", (req, res) => {
  res.json(readData())
})

// 📌 Upload global PDF
router.post("/pdf", upload.single("pdf"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF required" })

    const data = readData()

    if (data.pdf) {
      const rel = data.pdf.startsWith("/") ? data.pdf.slice(1) : data.pdf
      const oldPath = path.join(process.cwd(), rel)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }

    data.pdf = `/uploads/di/diploma/${req.file.filename}`
    writeData(data)

    res.json({ success: true, pdf: data.pdf })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 📌 Delete global PDF
router.delete("/pdf", (req, res) => {
  try {
    const data = readData()
    if (data.pdf) {
      const rel = data.pdf.startsWith("/") ? data.pdf.slice(1) : data.pdf
      const oldPath = path.join(process.cwd(), rel)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }
    data.pdf = null
    writeData(data)
    res.json({ success: true, pdf: null })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 📌 Add new month
router.post("/", (req, res) => {
  try {
    console.log("📥 Incoming Request Body:", req.body)
    const { title, children } = req.body
    if (!title) return res.status(400).json({ error: "Title required" })

    const data = readData()
    if (!Array.isArray(data.items)) data.items = [] // ensure items is an array

    const newEntry = {
      id: Date.now(),
      title,
      children: Array.isArray(children) ? children : [],
    }
    data.items.push(newEntry)
    writeData(data)
    res.json(newEntry)
  } catch (err) {
    console.error("❌ Server Error:", err)
    res.status(500).json({ error: err.message })
  }
})

// 📌 Update month
router.put("/:id", (req, res) => {
  try {
    const id = Number(req.params.id)
    const { title, children } = req.body

    if (!title) return res.status(400).json({ error: "Title required" })
    if (!Array.isArray(children)) return res.status(400).json({ error: "Children must be array" })

    const data = readData()
    const idx = data.items.findIndex((i) => i.id === id)
    if (idx === -1) return res.status(404).json({ error: "Not found" })

    data.items[idx] = { ...data.items[idx], title, children }
    writeData(data)

    res.json(data.items[idx])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 📌 Delete month
router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id)
    const data = readData()
    const idx = data.items.findIndex((i) => i.id === id)
    if (idx === -1) return res.status(404).json({ error: "Not found" })

    const removed = data.items.splice(idx, 1)
    writeData(data)

    res.json({ success: true, removed })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
