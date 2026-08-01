import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { UserService } from "./user.service";
import ApiError from "../../utils/ApiError";
import validator from "../../utils/validator/auth.validator";
import { getAuthUser } from "../../utils/AuthUser";
import { User } from "../../models/user.model";
import { config } from "../../config/config";
import { CookiesNames } from "../../common/enum";

/**
 * Register User
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const isValidEmail = validator.validateEmail(email);
  const isValidPassword = validator.validatePassword(password);

  if (!firstName || !lastName) {
    throw new ApiError(400, "First name or last name is missing");
  }

  if (!isValidEmail.isValid) {
    throw new ApiError(400, isValidEmail.message);
  }

  if (!isValidPassword.isValid) {
    throw new ApiError(400, isValidPassword.message);
  }

  const response = await UserService.register(req.body);
  return res.status(response.statusCode).json(response);
});

/**
 * Login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const isValidEmail = validator.validateEmail(email);
  const isValidPassword = validator.validatePassword(password);

  if (!isValidEmail.isValid) {
    throw new ApiError(400, isValidEmail.message);
  }

  if (!isValidPassword.isValid) {
    throw new ApiError(400, isValidPassword.message);
  }

  const response = await UserService.login(req.body, res);
  return res.status(response.statusCode).json(response);
});

/**
 * Send OTP
 */
// export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
//   const result = await AuthService.sendOtp(req.body);
//   return res.status(200).json(result);
// });

/**
 * Verify Email
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const isValidEmail = validator.validateEmail(email);
  const isValidOTP = validator.validateOtp(otp);

  if (!isValidEmail.isValid) {
    throw new ApiError(400, isValidEmail.message);
  }

  if (!isValidOTP.isValid) {
    throw new ApiError(400, isValidOTP.message);
  }

  const response = await UserService.verifyEmail(req.body);
  return res.status(response.statusCode).json(response);
});

/**
 * Forgot Password
 */
// export const forgotPassword = asyncHandler(
//   async (req: Request, res: Response) => {
//     const result = await AuthService.forgotPassword(req.body);
//     return res.status(200).json(result);
//   },
// );

/**
 * Verify Forgot Password OTP
 */
// export const verifyForgotPasswordOtp = asyncHandler(
//   async (req: Request, res: Response) => {
//     const result = await AuthService.verifyForgotPasswordOtp(req.body);
//     return res.status(200).json(result);
//   },
// );

/**
 * Reset Password
 */
// export const resetPassword = asyncHandler(
//   async (req: Request, res: Response) => {
//     const result = await AuthService.resetPassword(req.body);
//     return res.status(200).json(result);
//   },
// );

/**
 * Refresh Token
 */
// export const refreshToken = asyncHandler(
//   async (req: Request, res: Response) => {
//     const result = await AuthService.refreshToken(req.body);
//     return res.status(200).json(result);
//   },
// );

/**
 * Logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);

  await User.findByIdAndUpdate(authUser._id, {
    refreshToken: null,
  });

  const cookieOptions = {
    secure: config.env === "production",
    sameSite: (config.env === "production" ? "none" : "lax") as "none" | "lax",
    path: "/",
  };

  // 1. Clear HttpOnly Access Token
  res.clearCookie(CookiesNames.USER_ACCESS, {
    ...cookieOptions,
    httpOnly: true,
  });

  // 2. Clear HttpOnly Refresh Token
  res.clearCookie(CookiesNames.USER_REFRESH, {
    ...cookieOptions,
    httpOnly: true,
  });

  // 3. Clear Client-Readable Indicator Cookie
  res.clearCookie("is_authenticated", {
    ...cookieOptions,
    httpOnly: false, // Matches how it was set!
  });

  return res.status(200).json({ success: true, message: "Logout Successfull" });
});

/**
 * Get Logged In User
 */
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);
    const response = await UserService.currentUser(authUser._id);
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Update user's profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const authUser = getAuthUser(req);

    const response = await UserService.updateProfile(
      authUser._id,
      req.body,
      (req as any).uploadedFile,
    );

    return res.status(response.statusCode).json(response);
  },
);
