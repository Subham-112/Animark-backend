import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { User } from "../models/user.model";
import { config } from "../config/config";
import { generateAccessToken } from "../utils/token";
import { CookiesNames } from "../common/enum";
import Admin from "../models/admin.model";

const ROLES = ["admin", "guest", "seller", "user"] as const;
export type Role = (typeof ROLES)[number];

export interface AuthenticatedRequest extends Request {
  user?: {
    role: Role;
    _id: string;
    email?: string;
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

  // Helper for performing silent token refresh
  const attemptRefresh = async (): Promise<boolean> => {
    if (!refreshToken) return false;
    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret,
      ) as { _id?: string; sub?: string; role?: string };

      const subject = decodedRefresh._id || decodedRefresh.sub;
      if (!subject) return false;

      let user;
      if (decodedRefresh.role === "admin") {
        user = await Admin.findById(subject).select("_id email status refreshToken").lean();
      } else {
        user = await User.findById(subject).select("_id email status refreshToken").lean();
      }

      if (
        !user ||
        user.refreshToken !== refreshToken ||
        user.status !== "active"
      ) {
        return false;
      }

      const newAccessToken = generateAccessToken({
        _id: String(user._id),
        email: user.email,
        role: decodedRefresh.role === "admin" ? "admin" : "user",
      });

      res.setHeader("Authorization", `Bearer ${newAccessToken}`);
      res.cookie(
        CookiesNames.USER_ACCESS,
        newAccessToken,
        getCookieOptions(config.jwt.accessMaxAge * 24 * 60), // In minutes
      );

      res.cookie("is_authenticated", "true", {
        httpOnly: false,
        secure: config.env === "production",
        sameSite: config.env === "production" ? "none" : "lax",
        maxAge: config.jwt.refreshMaxAge * 24 * 60 * 60 * 1000,
        path: "/",
      });

      (req as AuthenticatedRequest).user = {
        _id: String(user._id),
        role: decodedRefresh.role === "admin" ? "admin" : "user",
        email: user.email,
      };

      return true;
    } catch {
      return false;
    }
  };

  if (!accessToken) {
    const refreshed = await attemptRefresh();
    if (refreshed) return next();
    return sendError(res, 401, "Access token missing.");
  }

  try {
    const decoded = jwt.verify(accessToken, config.jwt.secret) as {
      _id?: string;
      sub?: string;
      role?: string;
    };

    const subject = decoded._id || decoded.sub;
    if (!subject) return sendError(res, 401, "Malformed token.");

    let user;
    if (decoded.role === "admin") {
      user = await Admin.findById(subject).select("_id email status").lean();
    } else {
      user = await User.findById(subject).select("_id email status").lean();
    }

    if (!user || user.status !== "active") {
      return sendError(res, 401, "Invalid or inactive account.");
    }

    (req as AuthenticatedRequest).user = {
      _id: String(user._id),
      role: decoded.role === "admin" ? "admin" : "user",
      email: user.email,
    };

    return next();
  } catch (err) {
    if (refreshToken) {
      const refreshed = await attemptRefresh();
      if (refreshed) return next();
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
