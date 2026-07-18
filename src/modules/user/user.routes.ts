import { Request, Router } from "express";
import { login, register, updateProfile, verifyEmail } from "./user.controller";
import {
  authenticateToken,
  authorize,
} from "../../middleware/authMiddleware";
import { uploadImage } from "../../middleware/upload.middleware";
import { getAuthUser } from "../../utils/AuthUser";

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

router.patch(
  "/profile",
  ...userAccess,
  uploadImage({
    folder: (req: Request) => {
      const authUser = getAuthUser(req);
      return `user/avatar/${authUser._id}`;
    },
  }),
  updateProfile,
);

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