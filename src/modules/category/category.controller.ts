import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { CategoryService } from "./category.service";
import { getAuthUser } from "../../utils/AuthUser";
import ApiError from "../../utils/ApiError";
import { IImage } from "../../common/image.schema";

const mapUploadedFileToIImage = (uploaded: any): IImage => ({
  url: uploaded.url,
  publicId: uploaded.publicId,
  key: uploaded.publicId,
  name: uploaded.publicId?.split("/").pop(),
  size: uploaded.bytes,
  mimetype: uploaded.format ? `image/${uploaded.format}` : undefined,
});

/**
 * Create Category (Admin Only)
 */
export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const { name, description, image: bodyImage } = req.body;

    if (!name) {
      throw new ApiError(400, "Category name is required.");
    }

    const uploadedFile = (req as any).uploadedFile;
    let image: IImage | undefined = bodyImage;

    if (uploadedFile) {
      image = mapUploadedFileToIImage(uploadedFile);
    }

    const payload = {
      name,
      description,
    };

    const response = await CategoryService.createCategory(
      authUser._id,
      payload,
      image,
    );

    return res.status(response.statusCode).json(response);
  },
);

/**
 * Get All Categories (Authenticated Users/Admins)
 */
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await CategoryService.getAllCategories(req.query);
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Get Category By ID or Slug (Authenticated Users/Admins)
 */
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const response = await CategoryService.getCategoryById(id as string);
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Update Category (Admin Only)
 */
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, status, image: bodyImage } = req.body;

    const uploadedFile = (req as any).uploadedFile;
    let image: IImage | undefined = bodyImage;

    if (uploadedFile) {
      image = mapUploadedFileToIImage(uploadedFile);
    }

    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (status !== undefined) payload.status = status;

    const response = await CategoryService.updateCategory(
      id as string,
      payload,
      image,
    );

    return res.status(response.statusCode).json(response);
  },
);

/**
 * Toggle Category Status (Admin Only)
 */
export const toggleCategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const response = await CategoryService.toggleCategoryStatus(id as string);

    return res.status(response.statusCode).json(response);
  },
);

/**
 * Delete Category (Admin Only)
 */
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const { id } = req.params;

    const response = await CategoryService.deleteCategory(
      id as string,
      authUser._id,
    );

    return res.status(response.statusCode).json(response);
  },
);
