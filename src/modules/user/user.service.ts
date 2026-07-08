import { User } from "../../models/user.model";
import {
  UserLoginPayload,
  UserRegisterPayload,
  VerifyEmailPayload,
} from "../../types/auth.type";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import { comparePassword, hashPassword } from "../../utils/password";
import addEmailJob from "../../jobs/producers/email.producer";
import { otpTemplate } from "../../services/email/templates/otp.template";
import Otp from "../../models/otp.model";
import { CookiesNames, OtpPurpose, UserStatus } from "../../common/enum";
import { config } from "../../config/config";
import { generateOtp } from "../../utils/otp";
import { welcomeUserTemplate } from "../../services/email/templates/welcome.user.template";
import validator from "../../utils/validator/auth.validator";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { Response } from "express";

export const UserService = {
  /**
   * Register User
   */
  async register(payload: UserRegisterPayload) {
    const { firstName, lastName, email, password } = payload;

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      throw new ApiError(409, "User already exists.");
    }

    // Remove previous pending registration
    await Otp.deleteMany({
      email: normalizedEmail,
      purpose: OtpPurpose.REGISTER,
    });

    // Generate OTP
    const otp = generateOtp();

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Save registration in OTP collection
    await Otp.create({
      email: normalizedEmail,
      otp,
      verified: false,
      purpose: OtpPurpose.REGISTER,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      data: {
        firstName,
        lastName,
        role: "user",
        password: hashedPassword,
      },
    });

    // Queue email
    await addEmailJob({
      to: normalizedEmail,
      subject: "Verify your email",
      html: otpTemplate({
        name: firstName,
        otp,
        expiryMinutes: 10,
      }),
    });

    const res: { email: string; otp?: string } = { email: normalizedEmail };
    if (config.env === "dev") res.otp = otp;

    return new ApiResponse(
      200,
      res,
      "We've sent a verification OTP to your email address.",
    );
  },

  /**
   * Login User
   */
  async login(payload: UserLoginPayload, res: Response) {
    const { email, password } = payload;

    const normalizedEmail = validator.normalizeEmail(email);
    const isValidEmail = validator.validateEmail(normalizedEmail);

    if (!isValidEmail.isValid) {
      throw new ApiError(400, isValidEmail.message);
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password +refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    if (!user.isEmailVerified) {
      throw new ApiError(403, "Please verify your email before logging in.");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError(403, "Your account is not active.");
    }

    const isPasswordMatched = await comparePassword(password, user.password);

    if (!isPasswordMatched) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const tokenPayload = {
      _id: String(user._id),
      email: user.email,
      role: "user",
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie(CookiesNames.USER_ACCESS, accessToken, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: config.env === "production" ? "none" : "lax",
      maxAge: config.jwt.accessMaxAge * 60 * 1000,
      path: "/",
    });

    res.cookie(CookiesNames.USER_REFRESH, refreshToken, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: config.env === "production" ? "none" : "lax",
      maxAge: config.jwt.refreshMaxAge * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const result: any = {
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    };

    return new ApiResponse(200, result, "Login complete");
  },

  /**
   * Send OTP
   */
  async sendOtp(payload: any) {},

  /**
   * Verify Email
   */
  async verifyEmail(payload: VerifyEmailPayload) {
    const { email, otp } = payload;

    const normalizedEmail = email.trim().toLowerCase();

    const otpDocument = await Otp.findOne({
      email: normalizedEmail,
      otp,
      purpose: OtpPurpose.REGISTER,
    });

    if (!otpDocument) {
      throw new ApiError(400, "Invalid OTP.");
    }

    if (otpDocument.verified) {
      throw new ApiError(400, "OTP has already been verified.");
    }

    if (otpDocument.expiresAt < new Date()) {
      throw new ApiError(400, "OTP has expired.");
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      throw new ApiError(409, "User already exists.");
    }

    const registrationData = otpDocument.data;

    const user = await User.create({
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: normalizedEmail,
      password: registrationData.password,

      isEmailVerified: true,
      status: UserStatus.ACTIVE,
    });

    await Otp.deleteOne({
      _id: otpDocument._id,
    });

    await addEmailJob({
      to: user.email,
      subject: "Welcome to Animark",
      html: welcomeUserTemplate({
        name: user.firstName,
        loginUrl: `${config.client.url}/login`,
      }),
    });

    const res = {
      id: user._id,
      email: user.email,
    };

    return new ApiResponse(200, res, "Email verified successfully.");
  },

  /**
   * Forgot Password
   */
  async forgotPassword(payload: any) {},

  /**
   * Verify Forgot Password OTP
   */
  async verifyForgotPasswordOtp(payload: any) {},

  /**
   * Reset Password
   */
  async resetPassword(payload: any) {},

  /**
   * Refresh Access Token
   */
  async refreshToken(payload: any) {},

  /**
   * Logout
   */
  async logout(req: any) {},

  /**
   * Logged In User
   */
  async me(req: any) {},
};
