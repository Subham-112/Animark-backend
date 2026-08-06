import Admin from "../../models/admin.model";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { CommonStatus, CookiesNames, Roles } from "../../common/enum";
import { config } from "../../config/config";
import { Response } from "express";

export interface AdminRegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AdminLoginPayload {
  emailOrUsername: string;
  password: string;
}

export const AdminService = {
  /**
   * Register Admin
   */
  async register(payload: AdminRegisterPayload) {
    const { username, email, password } = payload;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const existingAdmin = await Admin.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingAdmin) {
      throw new ApiError(409, "Admin with this email or username already exists.");
    }

    const admin = await Admin.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      status: CommonStatus.ACTIVE,
    });

    const result = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      status: admin.status,
      createdAt: admin.createdAt,
    };

    return new ApiResponse(201, result, "Admin registered successfully.");
  },

  /**
   * Login Admin
   */
  async login(payload: AdminLoginPayload, res: Response) {
    const { emailOrUsername, password } = payload;

    const identifier = emailOrUsername.trim().toLowerCase();

    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!admin) {
      throw new ApiError(401, "Invalid credentials.");
    }

    if (admin.status !== CommonStatus.ACTIVE) {
      throw new ApiError(403, "Your admin account is not active.");
    }

    const isPasswordMatched = await admin.comparePassword(password);

    if (!isPasswordMatched) {
      throw new ApiError(401, "Invalid credentials.");
    }

    const tokenPayload = {
      _id: String(admin._id),
      email: admin.email,
      username: admin.username,
      role: Roles.ADMIN,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    admin.refreshToken = refreshToken;
    await admin.save();

    res.cookie(CookiesNames.ADMIN_ACCESS, accessToken, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: config.env === "production" ? "none" : "lax",
      maxAge: config.jwt.accessMaxAge * 24 * 60 * 1000,
      path: "/",
    });

    res.cookie(CookiesNames.ADMIN_REFRESH, refreshToken, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: config.env === "production" ? "none" : "lax",
      maxAge: config.jwt.refreshMaxAge * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const result = {
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        status: admin.status,
        role: Roles.ADMIN,
      },
    };

    return new ApiResponse(200, result, "Admin login successful.");
  },
};
