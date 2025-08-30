import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Range"],
  })
);

app.use(express.json());

// ✅ Ensure uploads folder exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// ✅ Serve uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Basic test route
app.get("/api", (req, res) => {
  res.send("API is running ✅");
});

// -------------------------
// ✅ Import routes
// -------------------------
import HomeBanner from "./Routes/Home/HomeBannerRoutes.js";
import VideoRoutes from "./Routes/Home/VideoGalleryRoutes.js";
import MentorRoutes from "./Routes/Home/HomeMentorRoutes.js";
import HomeExclusive from "./Routes/Home/HomeExclusive.js";
import HomeFilmography from "./Routes/Home/HomeFilmography.js";

import DirectionBanner from "./Routes/Direction/DirectionBanner.js";
import DirectionHighlights from "./Routes/Direction/DirectionHighlights.js";
import DirectionDiploma from "./Routes/Direction/DirectionDiploma.js";
import DirectionMentor from "./Routes/Direction/DirectionMentor.js";
import DirectionFilmography from "./Routes/Direction/DirectionFilmography.js";

import ActingBanner from "./Routes/Acting/ActingBanner.js";
import ActingMentor from "./Routes/Acting/ActingMentor.js";
import ActingDiploma from "./Routes/Acting/ActingDiploma.js";

import CinematographyBanner from "./Routes/Cinematography/CinematographyBanner.js";
import CinematographyHighlights from "./Routes/Cinematography/CinematographyHighlights.js";
import CinematographyDiploma from "./Routes/Cinematography/CinematographyDiploma.js";
import CinematographyMentor from "./Routes/Cinematography/CinematographyMentor.js";
import CinematographyFilmography from "./Routes/Cinematography/CinematographyFilmography.js";

import DiBanner from "./Routes/Di/DiBanner.js";
import DiHighlights from "./Routes/Di/DiHighlights.js";
import DiMentor from "./Routes/Di/DiMentor.js";
import DiFilmography from "./Routes/Di/DiFilmography.js";
import DiDiploma from "./Routes/Di/DiDiploma.js";

import EditingBanner from "./Routes/Editing/EditingBanner.js";
import EditingHighlights from "./Routes/Editing/EditingHighlights.js";
import EditingDiploma from "./Routes/Editing/EditingDiploma.js";
import EditingMentor from "./Routes/Editing/EditingMentor.js";
import EditingFilmography from "./Routes/Editing/EditingFilmography.js";

import PhotographyBanner from "./Routes/Photography/PhotographyBanner.js";
import PhotographyMentor from "./Routes/Photography/PhotographyMentor.js";
import PhotographyFilmography from "./Routes/Photography/PhotographyFilmography.js";
import PhotographyDiploma from "./Routes/Photography/PhotographyDiploma.js";

import VfxBanner from "./Routes/Vfx/vfxBanner.js";
import VfxHighlights from "./Routes/Vfx/vfxHighlights.js";
import VfxDiploma from "./Routes/Vfx/vfxDiploma.js";
import VfxMentor from "./Routes/Vfx/vfxMentor.js";
import VfxFilmography from "./Routes/Vfx/vfxFilmography.js";

import VirtualProductionBanner from "./Routes/VirtualProduction/VirtualProductionBanner.js";
import VirtualProductionMentor from "./Routes/VirtualProduction/VirtualProductionMentor.js";
import VirtualProductionFilmography from "./Routes/VirtualProduction/VirtualProductionFilmography.js";
import VirtualProductionDiploma from "./Routes/VirtualProduction/VirtualProductionDiploma.js";

import CfaBanner from "./Routes/Cfa/CfaBanner.js";
import CfaDiploma from "./Routes/Cfa/CfaDiploma.js";
import CfaMentor from "./Routes/Cfa/CfaMentor.js";
import CfaFilmography from "./Routes/Cfa/CfaFilmography.js";

import StageUnrealBanner from "./Routes/StageUnreal/StageUnrealBanner.js";
import StageUnrealDiploma from "./Routes/StageUnreal/StageUnrealDiploma.js";
import StageUnrealMentor from "./Routes/StageUnreal/StageUnrealMentor.js";
import StageUnrealFilmography from "./Routes/StageUnreal/StageUnrealFilmography.js";

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
app.use("/actingmentor", ActingMentor);
app.use("/actingdiploma", ActingDiploma);

app.use("/cinematographybanner", CinematographyBanner);
app.use("/cinematographyhighlights", CinematographyHighlights);
app.use("/cinematographydiploma", CinematographyDiploma);
app.use("/cinematographymentor", CinematographyMentor);
app.use("/cinematographyfilmography", CinematographyFilmography);

app.use("/dibanner", DiBanner);
app.use("/dihighlights", DiHighlights);
app.use("/dimentor", DiMentor);
app.use("/difilmography", DiFilmography);
app.use("/didiploma", DiDiploma);

app.use("/editingbanner", EditingBanner);
app.use("/editinghighlights", EditingHighlights);
app.use("/editingdiploma", EditingDiploma);
app.use("/editingmentor", EditingMentor);
app.use("/editingfilmography", EditingFilmography);

app.use("/photographybanner", PhotographyBanner);
app.use("/photographymentor", PhotographyMentor);
app.use("/photographyfilmography", PhotographyFilmography);
app.use("/photographydiploma", PhotographyDiploma);

app.use("/vfxbanner", VfxBanner);
app.use("/vfxhighlights", VfxHighlights);
app.use("/vfxdiploma", VfxDiploma);
app.use("/vfxmentor", VfxMentor);
app.use("/vfxfilmography", VfxFilmography);

app.use("/virtualproductionbanner", VirtualProductionBanner);
app.use("/virtualproductionmentor", VirtualProductionMentor);
app.use("/virtualproductionfilmography", VirtualProductionFilmography);
app.use("/virtualproductiondiploma", VirtualProductionDiploma);

app.use("/cfabanner", CfaBanner);
app.use("/cfadiploma", CfaDiploma);
app.use("/cfamentor", CfaMentor);
app.use("/cfafilmography", CfaFilmography);

app.use("/stageunrealbanner", StageUnrealBanner);
app.use("/stageunrealdiploma", StageUnrealDiploma);
app.use("/stageunrealmentor", StageUnrealMentor);
app.use("/stageunrealfilmography", StageUnrealFilmography);

// -------------------------
// ✅ Serve React frontend (MUST be after API routes)
// -------------------------
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/client/build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ✅ Start server AFTER everything is set
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
