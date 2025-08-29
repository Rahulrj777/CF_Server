import express from "express"
import multer from "multer"
import fs from "fs"
import path from "path"

const router = express.Router()

// Paths
const DATA_DIR = path.join(process.cwd(), "data/editing")
const DIPLOMA_JSON = path.join(DATA_DIR, "diploma.json")
const UPLOADS_DIR = path.join(process.cwd(), "uploads/editing/diploma")

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
if (!fs.existsSync(path.dirname(DIPLOMA_JSON))) fs.mkdirSync(path.dirname(DIPLOMA_JSON), { recursive: true })
if (!fs.existsSync(DIPLOMA_JSON)) fs.writeFileSync(DIPLOMA_JSON, JSON.stringify({ months: [], pdf: "" }))

// Multer storage (save with original name + timestamp)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
})
const upload = multer({ storage })

// 👉 GET /editingdiploma
router.get("/", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DIPLOMA_JSON))
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: "Error reading diploma data" })
  }
})

// 👉 POST /editingdiploma/save
router.post("/save", upload.any(), (req, res) => {
  try {
    const current = JSON.parse(fs.readFileSync(DIPLOMA_JSON))

    const data = { months: current.months || [], pdf: current.pdf || "" }

    if (typeof req.body.months === "string" && req.body.months.length) {
      try {
        data.months = JSON.parse(req.body.months)
      } catch {
        // ignore malformed months; keep existing
      }
    }

    // Handle uploaded files (support single global PDF and optional item PDFs)
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.fieldname === "pdf_global") {
          if (data.pdf) {
            const oldPath = path.join(process.cwd(), data.pdf.replace(/^\//, ""))
            if (fs.existsSync(oldPath)) {
              try {
                fs.unlinkSync(oldPath)
              } catch (e) {
                console.warn("Could not delete old PDF:", e.message)
              }
            }
          }
          data.pdf = `/uploads/editing/diploma/${file.filename}`
        } else if (file.fieldname.startsWith("pdf_")) {
          const [m, s, i] = file.fieldname.replace("pdf_", "").split("_")
          if (data.months[m] && data.months[m].sections?.[s]?.items?.[i]) {
            data.months[m].sections[s].items[i].pdf = `/uploads/editing/diploma/${file.filename}`
          }
        }
      })
    }

    fs.writeFileSync(DIPLOMA_JSON, JSON.stringify(data, null, 2))
    res.json({ message: "Saved successfully", data })
  } catch (error) {
    console.error("Error saving diploma data:", error)
    res.status(500).json({ message: "Error saving diploma data" })
  }
})

router.delete("/pdf", (req, res) => {
  try {
    const { file } = req.body || req.query
    const data = JSON.parse(fs.readFileSync(DIPLOMA_JSON))

    // If a specific file provided, only delete when it matches current saved
    if (file && data.pdf && file === data.pdf) {
      const absPath = path.join(process.cwd(), file.replace(/^\//, ""))
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath)
      data.pdf = ""
    } else if (!file && data.pdf) {
      // fallback: delete whatever is saved
      const absPath = path.join(process.cwd(), data.pdf.replace(/^\//, ""))
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath)
      data.pdf = ""
    }

    fs.writeFileSync(DIPLOMA_JSON, JSON.stringify(data, null, 2))
    res.json({ message: "PDF deleted", data })
  } catch (e) {
    console.error("Error deleting PDF:", e)
    res.status(500).json({ message: "Error deleting PDF" })
  }
})

export default router
