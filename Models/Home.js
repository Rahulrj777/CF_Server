import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({
  banner: [{ imageUrl: { type: String, required: true } }],
  mentor: [{ imageUrl: { type: String, required: true } }],
  filmography: [{ imageUrl: { type: String, required: true } }],
  videoGallery: [
    {
      videoUrl: { type: String, required: true },
      title: { type: String, required: true },
    },
  ],
  exclusive: [
    {
      imageUrl: { type: String, required: true },
      title: { type: String, required: true },
    },
  ],
}, { timestamps: true });

const Home = mongoose.model("Home", homeSchema);
export default Home;
