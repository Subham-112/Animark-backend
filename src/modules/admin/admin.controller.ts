import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AdminService } from "./admin.service";
import ApiError from "../../utils/ApiError";
import validator from "../../utils/validator/auth.validator";

/**
 * Admin Register
 */
export const registerAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new ApiError(400, "Username, email, and password are required.");
    }

    const isValidEmail = validator.validateEmail(email);
    if (!isValidEmail.isValid) {
      throw new ApiError(400, isValidEmail.message);
    }

    const isValidPassword = validator.validatePassword(password);
    if (!isValidPassword.isValid) {
      throw new ApiError(400, isValidPassword.message);
    }

    const response = await AdminService.register(req.body);
    return res.status(response.statusCode).json(response);
  },
);

/**
 * Admin Login
 */
export const loginAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      throw new ApiError(400, "Email/Username and password are required.");
    }

    const response = await AdminService.login(req.body, res);
    return res.status(response.statusCode).json(response);
  },
);
