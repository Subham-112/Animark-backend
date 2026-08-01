import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getAuthUser } from "../../utils/AuthUser";
import ApiError from "../../utils/ApiError";
import { SellerService } from "./seller.service";
import { UpdateSellerProfilePayload } from "../../types/auth.type";

/**
 * Apply as Seller
 */
export const apply = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);

  const { displayName, bio, socialLinks } = req.body;

  if (!displayName?.trim()) {
    throw new ApiError(400, "Display name is required.");
  }

  if (!socialLinks) {
    throw new ApiError(400, "At least one social link is required.");
  }

  const hasAtLeastOneSocialLink = Object.values(socialLinks).some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  if (!hasAtLeastOneSocialLink) {
    throw new ApiError(400, "Please provide at least one social link.");
  }

  const response = await SellerService.apply(authUser._id, {
    displayName,
    bio,
    socialLinks
  });

  return res.status(response.statusCode).json(response);
});

/**
 * Get Current Seller
 */
export const getCurrentSeller = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);

    const response = await SellerService.currentUser(authUser._id);

    return res.status(response.statusCode).json(response);
  },
);

/**
 * Update Seller Profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);

    const { displayName, bio, socialLinks } = req.body;

    if (displayName !== undefined && !displayName.trim()) {
      throw new ApiError(400, "Display name cannot be empty.");
    }

    if (bio !== undefined && bio.length > 500) {
      throw new ApiError(400, "Bio cannot exceed 500 characters.");
    }

    const uploadedFile = (req as any).uploadedFile;

    const payload: UpdateSellerProfilePayload = {
      displayName,
      bio,
      socialLinks,
      image: uploadedFile,
    };

    const response = await SellerService.updateProfile(authUser._id, payload);

    return res.status(response.statusCode).json(response);
  },
);

/**
 * Public Seller Profile
 */
export const getPublicProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const slug = req.params.slug;

    if (typeof slug !== "string" || !slug.trim()) {
      throw new ApiError(400, "Invalid seller slug.");
    }

    const response = await SellerService.getPublicProfile(slug);

    return res.status(response.statusCode).json(response);
  },
);
