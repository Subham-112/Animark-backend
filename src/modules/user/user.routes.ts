import { Router } from "express";
import { login, register, verifyEmail } from "./user.controller";
import {
  authenticateToken,
  authorize,
} from "../../middleware/authMiddleware";

const router = Router();

/**
 * Public Routes
 */
router.post("/register", register);
router.post("/login", login);
// router.post("/resend-otp", );
router.post("/verify-email", verifyEmail);
// router.post("/forgot-password", );
// router.post(
//   "/verify-forgot-password-otp",

// );
// router.post("/reset-password", );
// router.post("/refresh-token", );

/**
 * Protected Routes
 */
const userAccess = [
  authenticateToken,
  authorize("user"),
];

// router.post(
//   "/logout",
//   ...userAccess,

// );

// router.get(
//   "/me",
//   ...userAccess,
  
// );

// Example
// router.get("/profile", userAccess, AuthController.getProfile);

export default router;