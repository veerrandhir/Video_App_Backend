import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload local file path or buffer. If passing a buffer, set { resource_type: 'auto' }
// :TODO  Set Cloudinary_Cloud_name and API_KEY in .env variable

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload file form local path

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file uploaded on cloudinary successfully ", response);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // if encounter any error remove temp uploaded file or any unuseful file
    return null; // to return nothing has been saved on cloud
  }
};

export { uploadOnCloudinary };
