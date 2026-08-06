import { Router } from "express";
import userRoutes from "../modules/user/user.routes";
import sellerRoutes from "../modules/seller/seller.router";
import productRoutes from "../modules/product/product.routes";
import categoryRoutes from "../modules/category/category.routes";
import adminRoutes from "../modules/admin/admin.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/sellers", sellerRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/admin", adminRoutes);

export default router;