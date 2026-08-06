import { Router } from "express";
import { authenticateToken, authorize } from "../../middleware/authMiddleware";
import { uploadImage } from "../../middleware/upload.middleware";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  toggleCategoryStatus,
  updateCategory,
} from "./category.controller";

const router = Router();

// Protect all category routes with authentication token
router.use(authenticateToken);

// Public / Authenticated read routes (User, Seller, Admin)
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin-only management routes
router.post(
  "/",
  authorize("admin"),
  uploadImage({ folder: "categories", multiple: false }),
  createCategory,
);

router.put(
  "/:id",
  authorize("admin"),
  uploadImage({ folder: "categories", multiple: false }),
  updateCategory,
);

router.patch("/:id/status", authorize("admin"), toggleCategoryStatus);

router.delete("/:id", authorize("admin"), deleteCategory);

export default router;
