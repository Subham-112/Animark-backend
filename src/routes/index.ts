import { Router } from "express";
import userRoutes from "../modules/user/user.routes";
import sellerRoutes from "../modules/seller/seller.router";

const router = Router();

router.use("/users", userRoutes);
router.use("/sellers", sellerRoutes);

export default router;