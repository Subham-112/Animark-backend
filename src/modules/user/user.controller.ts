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

  res.clearCookie(CookiesNames.USER_ACCESS, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    path: "/",
  });

  res.clearCookie(CookiesNames.USER_REFRESH, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    path: "/",
  });

  return {
    success: true,
    message: "Logged out successfully.",
  };
});

/**
 * Get Logged In User
 */
// export const me = asyncHandler(async (req: Request, res: Response) => {
//   const result = await AuthService.me(req);
//   return res.status(200).json(result);
// });

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
