// cloudinaryUpload.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const getMulterUpload = (folder = "uploads") => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      let resource_type = "raw";

      if (file.mimetype.startsWith("image/")) resource_type = "image";
      else if (file.mimetype.startsWith("video/")) resource_type = "video";

      return {
        folder,
        resource_type,
      };
    },
  });

  return multer({ storage });
};
