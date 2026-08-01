import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { User } from "../models/user.model";
import { config } from "../config/config";
import { generateAccessToken } from "../utils/token";
import { CookiesNames } from "../common/enum";

const ROLES = ["admin", "guest", "seller", "user"] as const;
export type Role = (typeof ROLES)[number];

export interface AuthenticatedRequest extends Request {
  user?: {
    role: Role;
    _id: string;
    email?: string;
    mobile?: string;
  };
}

// Cookie Helper Options
const getCookieOptions = (maxAgeInMinutes: number) => ({
  httpOnly: true,
  secure: config.env === "production",
  sameSite: (config.env === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: maxAgeInMinutes * 60 * 1000,
  path: "/",
});

// Helper for Standardized Error Responses
const sendError = (res: Response, statusCode: number, message: string) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const accessToken =
    req.cookies?.[CookiesNames.USER_ACCESS] ||
    req.header("Authorization")?.replace("Bearer ", "");

  const refreshToken = req.cookies?.[CookiesNames.USER_REFRESH];

  if (!accessToken) {
    return sendError(res, 401, "Access token missing.");
  }

  try {
    const decoded = jwt.verify(accessToken, config.jwt.secret) as {
      _id?: string;
      sub?: string;
    };

    const subject = decoded._id || decoded.sub;
    if (!subject) return sendError(res, 401, "Malformed token.");

    const user = await User.findById(subject).select("_id email mobile status");

    if (!user || user.status !== "active") {
      return sendError(res, 401, "Invalid or inactive account.");
    }

    (req as AuthenticatedRequest).user = {
      _id: String(user._id),
      role: "user",
      email: user.email,
      mobile: user.mobile,
    };

    return next();
  } catch (err) {
    // Attempt Token Refresh if Access Token Expired
    if (err instanceof TokenExpiredError && refreshToken) {
      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          config.jwt.refreshSecret,
        ) as { _id?: string; sub?: string };

        const subject = decodedRefresh._id || decodedRefresh.sub;
        if (!subject) return sendError(res, 403, "Invalid refresh token.");

        const user = await User.findById(subject);

        // Security Check: Verify refresh token match AND user active status
        if (
          !user ||
          user.refreshToken !== refreshToken ||
          user.status !== "active"
        ) {
          return sendError(res, 403, "Invalid session or account inactive.");
        }

        const newAccessToken = generateAccessToken({
          _id: String(user._id),
          email: user.email,
          role: "user",
        });

        // Set Updated Cookies
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        res.cookie(
          CookiesNames.USER_ACCESS,
          newAccessToken,
          getCookieOptions(config.jwt.accessMaxAge),
        );

        (req as AuthenticatedRequest).user = {
          _id: String(user._id),
          role: "user",
          email: user.email,
          mobile: user.mobile,
        };

        return next();
      } catch {
        return sendError(res, 401, "Session expired. Please log in again.");
      }
    }

    return sendError(
      res,
      401,
      err instanceof JsonWebTokenError
        ? "Invalid access token."
        : "Invalid or expired access token.",
    );
  }
};

export const authorize =
  (...allowedRoles: Role[]): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      sendError(res, 401, "Unauthorized. Please log in.");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Role '${user.role}' lacks required permissions.`,
        allowedRoles,
      });
      return;
    }

    return next();
  };
