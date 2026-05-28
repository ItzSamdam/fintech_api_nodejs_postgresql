import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { config } from "@/shared/config";

dotenv.config();

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

interface ImageInfo {
  url: string;
  publicId: string;
}

export const generateSignedUrl = async (publicId: string): Promise<string> => {
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 300, // 5 minutes expiry
  });
};

export const uploadImages = async (
  files: Record<string, any>, // adjust type based on your upload lib
  validFileList: string[],
): Promise<ImageInfo[]> => {
  const storeImages: ImageInfo[] = [];

  await Promise.all(
    validFileList.map(async (item) => {
      const fileItem = files[item];
      if (fileItem?.[0]?.filepath) {
        try {
          const image = await cloudinary.uploader.upload(fileItem[0].filepath as string, {
            resource_type: "image",
            overwrite: true,
            notification_url: `${config.app.domain}/notify_cloudinary`,
          });

          storeImages.push({
            url: image.secure_url,
            publicId: image.public_id,
          });
        } catch (err: any) {
          console.error(`Error uploading ${item}:`, err.message);
        }
      }
    }),
  );

  return storeImages;
};
