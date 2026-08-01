import { Request, Router } from "express";

import {
  apply,
  getCurrentSeller,
  getPublicProfile,
  updateProfile,
} from "./seller.controller";

import { authenticateToken, authorize } from "../../middleware/authMiddleware";

import { uploadImage } from "../../middleware/upload.middleware";
import { getAuthUser } from "../../utils/AuthUser";

const router = Router();

/**
 * Protected Routes
 */
const userAccess = [authenticateToken, authorize("user")];

/**
 * Apply to become Seller
 */
router.post("/apply", ...userAccess, apply);

/**
 * Get Current Seller
 */
router.get("/get-current", ...userAccess, getCurrentSeller);

/**
 * Update Seller Profile
 */
router.patch(
  "/profile",
  ...userAccess,
  uploadImage({
    folder: (req: Request) => {
      const authUser = getAuthUser(req);
      return `seller/profile/${authUser._id}`;
    },
  }),
  updateProfile,
);

/**
 * Public Seller Profile
 */
router.get("/:slug", getPublicProfile);

export default router;
