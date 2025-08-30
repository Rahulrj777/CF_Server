import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// ✅ Enable CORS for frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000",
      "https://cf-admin.vercel.app",
      "https://cf-user.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "DELETE","PUT"],
    allowedHeaders: ["Content-Type", "Range"],
  })
);

// ✅ Parse JSON requests
app.use(express.json());

// ✅ Ensure uploads folder exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// ✅ Serve static uploads
app.use("/uploads", express.static(UPLOADS_DIR));

// ✅ Basic route
app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// ✅ Import routes
import HomeBanner from "./Routes/Home/HomeBannerRoutes.js";
import VideoRoutes from "./Routes/Home/VideoGalleryRoutes.js";
import MentorRoutes from "./Routes/Home/HomeMentorRoutes.js";
import HomeExclusive from "./Routes/Home/HomeExclusive.js";
import HomeFilmography from "./Routes/Home/HomeFilmography.js";

// Direction
import DirectionBanner from "./Routes/Direction/DirectionBanner.js";
import DirectionHighlights from "./Routes/Direction/DirectionHighlights.js";
import DirectionDiploma from "./Routes/Direction/DirectionDiploma.js";
import DirectionMentor from "./Routes/Direction/DirectionMentor.js"
import DirectionFilmography from "./Routes/Direction/DirectionFilmography.js"

// Acting
import ActingBanner from "./Routes/Acting/ActingBanner.js";
import ActingMentor from "./Routes/Acting/ActingMentor.js"
import ActingDiploma from "./Routes/Acting/ActingDiploma.js"

// Cinematography
import CinematographyBanner from "./Routes/Cinematography/CinematographyBanner.js";
import CinematographyHighlights from "./Routes/Cinematography/CinematographyHighlights.js";
import CinematographyDiploma from "./Routes/Cinematography/CinematographyDiploma.js"
import CinematographyMentor from "./Routes/Cinematography/CinematographyMentor.js"
import CinematographyFilmography from "./Routes/Cinematography/CinematographyFilmography.js"

// Di
import DiBanner from "./Routes/Di/DiBanner.js";
import DiHighlights from "./Routes/Di/DiHighlights.js";
import DiMentor from "./Routes/Di/DiMentor.js"
import DiFilmography from "./Routes/Di/DiFilmography.js"
import DiDiploma from "./Routes/Di/DiDiploma.js"

// Editing
import EditingBanner from "./Routes/Editing/EditingBanner.js";
import EditingHighlights from "./Routes/Editing/EditingHighlights.js";
import EditingDiploma from "./Routes/Editing/EditingDiploma.js"
import EditingMentor from "./Routes/Editing/EditingMentor.js"
import EditingFilmography from "./Routes/Editing/EditingFilmography.js"

// Photography
import PhotographyBanner from "./Routes/Photography/PhotographyBanner.js";
import PhotographyMentor from "./Routes/Photography/PhotographyMentor.js"
import PhotographyFilmography from "./Routes/Photography/PhotographyFilmography.js"
import PhotographyDiploma from "./Routes/Photography/PhotographyDiploma.js"

// Vfx
import VfxBanner from "./Routes/Vfx/vfxBanner.js";
import VfxHighlights from "./Routes/Vfx/vfxHighlights.js";
import VfxDiploma from "./Routes/Vfx/vfxDiploma.js"
import VfxMentor from "./Routes/Vfx/vfxMentor.js"
import VfxFilmography from "./Routes/Vfx/vfxFilmography.js"

// Virtual Production
import VirtualProductionBanner from "./Routes/VirtualProduction/VirtualProductionBanner.js";
import VirtualProductionMentor from "./Routes/VirtualProduction/VirtualProductionMentor.js"
import VirtualProductionFilmography from "./Routes/VirtualProduction/VirtualProductionFilmography.js"
import VirtualProductionDiploma from "./Routes/VirtualProduction/VirtualProductionDiploma.js"

// CFA
import CfaBanner from './Routes/Cfa/CfaBanner.js'

// VideoBanner
import StageUnrealBanner from "./Routes/StageUnreal/StageUnrealBanner.js"

// ✅ Use routes
app.use("/homebanner", HomeBanner);
app.use("/exclusive", HomeExclusive);
app.use("/videos", VideoRoutes);
app.use("/mentors", MentorRoutes);
app.use("/homefilmography", HomeFilmography);

app.use("/directionbanner", DirectionBanner);
app.use("/directionhighlights", DirectionHighlights);
app.use("/directiondiploma", DirectionDiploma);
app.use("/directionmentor", DirectionMentor);
app.use("/directionfilmography", DirectionFilmography);

app.use("/actingbanner", ActingBanner);
app.use("/actingmentor", ActingMentor)
app.use("/actingdiploma", ActingDiploma)

app.use("/cinematographybanner", CinematographyBanner);
app.use("/cinematographyhighlights", CinematographyHighlights);
app.use("/cinematographydiploma", CinematographyDiploma);
app.use("/cinematographymentor", CinematographyMentor)
app.use("/cinematographyfilmography", CinematographyFilmography)

app.use("/vfxbanner", VfxBanner);
app.use("/vfxhighlights", VfxHighlights);
app.use("/vfxdiploma", VfxDiploma)
app.use('/vfxmentor', VfxMentor)
app.use('/vfxfilmography', VfxFilmography)

app.use("/dibanner", DiBanner);
app.use("/dihighlights", DiHighlights);
app.use("/dimentor", DiMentor);
app.use("/difilmography", DiFilmography);
app.use("/didiploma", DiDiploma);

app.use("/photographybanner", PhotographyBanner);
app.use("/photographymentor", PhotographyMentor);
app.use("/photographyfilmography", PhotographyFilmography);
app.use("/photographydiploma", PhotographyDiploma);

app.use("/editingbanner", EditingBanner);
app.use("/editinghighlights", EditingHighlights);
app.use("/editingdiploma", EditingDiploma)
app.use("/editingmentor", EditingMentor)
app.use("/editingfilmography", EditingFilmography)

app.use("/virtualproductionbanner", VirtualProductionBanner);
app.use("/virtualproductionmentor", VirtualProductionMentor);
app.use("/virtualproductionfilmography", VirtualProductionFilmography);
app.use("/virtualproductiondiploma", VirtualProductionDiploma);

app.use('/cfabanner', CfaBanner)

app.use("/stageunrealbanner", StageUnrealBanner)

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});
