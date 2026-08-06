import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ProductService } from "./product.service";
import { getAuthUser } from "../../utils/AuthUser";
import ApiError from "../../utils/ApiError";
import { IImage } from "../../common/image.schema";

import cloudinaryService from "../../services/cloudinary/cloudinary.service";
import ApiResponse from "../../utils/ApiResponse";

const mapUploadedFileToIImage = (uploaded: any): IImage => ({
  url: uploaded.url,
  publicId: uploaded.publicId,
  key: uploaded.publicId,
  name: uploaded.publicId?.split("/").pop(),
  size: uploaded.bytes,
  mimetype: uploaded.format ? `image/${uploaded.format}` : undefined,
});

/**
 * Get Upload Signature for Client-side Direct Cloudinary Upload
 */
export const getUploadSignature = asyncHandler(
  async (req: Request, res: Response) => {
    const folder = (req.query.folder as string) || "products";
    const signatureData = cloudinaryService.generateSignature(folder);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          signatureData,
          "Upload signature generated successfully.",
        ),
      );
  },
);

/**
 * Create Product
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const { name, category, price, description, tags, metadata, thumbnail: bodyThumbnail, gallery: bodyGallery } = req.body;

    if (!name || !category || price === undefined) {
      throw new ApiError(400, "Name, category, and price are required.");
    }

    const uploadedFile = (req as any).uploadedFile;
    const uploadedFiles = (req as any).uploadedFiles;

    let thumbnail: IImage | undefined = bodyThumbnail;
    let gallery: IImage[] = Array.isArray(bodyGallery) ? bodyGallery : [];

    if (uploadedFile) {
      thumbnail = mapUploadedFileToIImage(uploadedFile);
    }

    if (uploadedFiles && Array.isArray(uploadedFiles)) {
      gallery = uploadedFiles.map(mapUploadedFileToIImage);
    }

    let parsedTags: string[] = [];
    let parsedMetadata: Record<string, any> = {};

    if (tags) {
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags.split(",").map((t) => t.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    if (metadata) {
      if (typeof metadata === "string") {
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch {
          parsedMetadata = {};
        }
      } else if (typeof metadata === "object") {
        parsedMetadata = metadata;
      }
    }

    const payload = {
      name,
      category,
      price: Number(price),
      description,
      tags: parsedTags,
      metadata: parsedMetadata,
    };

    const response = await ProductService.createProduct(
      authUser._id,
      authUser.role,
      payload,
      thumbnail,
      gallery,
    );

    return res.status(response.statusCode).json(response);
  },
);

/**
 * Get All Products
 */
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await ProductService.getAllProducts(req.query);
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Get Product By ID
 */
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const response = await ProductService.getProductById(id as string);
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Update Product
 */
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const { id } = req.params;
    const { name, category, price, description, status, tags, metadata } =
      req.body;

    const uploadedFile = (req as any).uploadedFile;
    const uploadedFiles = (req as any).uploadedFiles;

    let thumbnail: IImage | undefined;
    let gallery: IImage[] = [];

    if (uploadedFile) {
      thumbnail = mapUploadedFileToIImage(uploadedFile);
    }

    if (uploadedFiles && Array.isArray(uploadedFiles)) {
      gallery = uploadedFiles.map(mapUploadedFileToIImage);
    }

    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (category !== undefined) payload.category = category;
    if (price !== undefined) payload.price = Number(price);
    if (description !== undefined) payload.description = description;
    if (status !== undefined) payload.status = status;
    if (tags !== undefined)
      payload.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
    if (metadata !== undefined)
      payload.metadata =
        typeof metadata === "string" ? JSON.parse(metadata) : metadata;

    const response = await ProductService.updateProduct(
      id as string,
      authUser._id,
      authUser.role,
      payload,
      thumbnail,
      gallery,
    );

    return res.status(response.statusCode).json(response);
  },
);

/**
 * Toggle Product Status
 */
export const toggleProductStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const { id } = req.params;

    const response = await ProductService.toggleProductStatus(
      id as string,
      authUser._id,
      authUser.role,
    );

    return res.status(response.statusCode).json(response);
  },
);

/**
 * Delete Product
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const { id } = req.params;

    const response = await ProductService.deleteProduct(
      id as string,
      authUser._id,
      authUser.role,
    );

    return res.status(response.statusCode).json(response);
  },
);
