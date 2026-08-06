import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { uploadImage } from "../../middleware/upload.middleware";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getUploadSignature,
  toggleProductStatus,
  updateProduct,
} from "./product.controller";

const router = Router();

// Protected upload signature endpoint
router.get("/upload-signature", authenticateToken, getUploadSignature);

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes (User / Admin / Seller)
router.use(authenticateToken);

router.post(
  "/",
  uploadImage({ folder: "products", multiple: false }),
  createProduct,
);

router.put(
  "/:id",
  uploadImage({ folder: "products", multiple: false }),
  updateProduct,
);

router.patch("/:id/status", toggleProductStatus);

router.delete("/:id", deleteProduct);

export default router;
