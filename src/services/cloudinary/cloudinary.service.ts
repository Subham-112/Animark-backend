import streamifier from "streamifier";
import cloudinary from "../../config/cloudinary";

import {
  UploadImageOptions,
  UploadedImage,
  UploadedFile,
} from "./cloudinary.types";

const cloudinaryService = {
  /**
   * Upload Image
   */
  async uploadImage(
    file: UploadedFile,
    options: UploadImageOptions,
  ): Promise<UploadedImage> {
    const folder = options.subFolder
      ? `${options.folder}/${options.subFolder}`
      : options.folder;
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: options.publicId,
          overwrite: true,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error);
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  },

  /**
   * Delete Image
   */
  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  },

  /**
   * Delete Folder
   */
  async deleteFolder(folder: string): Promise<void> {
    await cloudinary.api.delete_resources_by_prefix(folder);

    await cloudinary.api.delete_folder(folder);
  },
};

export default cloudinaryService;
