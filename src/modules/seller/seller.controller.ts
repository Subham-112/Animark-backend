import { Request, Response } from "express";
import ApiError from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import validator from "../../utils/validator/auth.validator";
import { SellerService } from "./seller.service";

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

  const response = await SellerService.register(req.body);
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

  const response = await SellerService.login(req.body, res);
  return res.status(response.statusCode).json(response);
});

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

  const response = await SellerService.verifyEmail(req.body);
  return res.status(response.statusCode).json(response);
});
