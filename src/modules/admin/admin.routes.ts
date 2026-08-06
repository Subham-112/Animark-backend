import { Router } from "express";
import { loginAdmin, registerAdmin } from "./admin.controller";

const router = Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

export default router;
