import Admin from "../models/admin.model";
import { config } from "../config/config";
import { User } from "../models/user.model";
import { generateAccessToken } from "../utils/token";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { Seller } from "../models/seller.model";
import { CookiesNames } from "../common/enum";

const ROLES = ["admin", "guest", "seller", "user"] as const;
export type Role = (typeof ROLES)[number];

interface AuthenticatedRequest extends Request {
  user?: {
    role: Role;
    _id: string;
    email?: string;
    mobile?: string;
  };
}

const isRole = (val: unknown): val is Role =>
  typeof val === "string" && ROLES.some((role) => role === val);

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
    return res
      .status(401)
      .json({ status: false, message: "Access token missing." });
  }

  try {
    const decoded = jwt.verify(accessToken, config.jwt.secret) as {
      _id?: string;
      role?: string;
      email?: string;
      mobile?: string;
      sub?: string; // in case some tokens use `sub`
    };

    const subject = decoded._id || decoded.sub;
    if (!subject) {
      return res
        .status(401)
        .json({ status: false, message: "Malformed token (missing subject)." });
    }

    const tokenRole: Role = isRole(decoded.role) ? decoded.role : "seller";

    // For restaurant sellers, verify account and status from DB
    if (tokenRole === "seller") {
      const seller = await Seller.findById(subject).select("_id email status");
      const isActive = seller?.status === "active";
      if (!seller || !isActive) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid or inactive account." });
      }

      (req as AuthenticatedRequest).user = {
        role: "seller",
        _id: seller.id,
        email: decoded.email ?? seller.email,
        mobile: decoded.mobile,
      };
    } else {
      // For admin/user-or-system roles trust token; dedicated routes can run extra checks
      (req as AuthenticatedRequest).user = {
        role: tokenRole,
        _id: subject,
        email: decoded.email,
        mobile: decoded.mobile,
      };
    }

    return next();
  } catch (err) {
    // Try refresh-token path only if access token expired and we have a refresh token
    if (err instanceof TokenExpiredError && refreshToken) {
      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          config.jwt.refreshSecret,
        ) as { _id?: string; role?: string; email?: string; sub?: string };

        const subject = decodedRefresh._id || decodedRefresh.sub;
        const tokenRole: Role = isRole(decodedRefresh.role)
          ? decodedRefresh.role
          : "seller";
        if (!subject) {
          return res.status(403).json({
            status: false,
            message: "Invalid refresh token (no subject).",
          });
        }

        const user = await getUserByRole(tokenRole, subject);

        if (!user || user.refreshToken !== refreshToken) {
          return res
            .status(403)
            .json({ status: false, message: "Invalid refresh token." });
        }

        // Issue new access token
        const newAccessToken = generateAccessToken({
          email: user.email,
          _id: user._id as string,
          role: tokenRole,
        });

        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        (req as AuthenticatedRequest).user = {
          _id: String(user._id),
          role: tokenRole,
          email: user.email,
        };

        res.cookie(CookiesNames.USER_ACCESS, newAccessToken, {
          httpOnly: true,
          secure: config.env === "production",
          sameSite: config.env === "production" ? "none" : "lax",
          maxAge: config.jwt.accessMaxAge * 60 * 1000,
          path: "/",
        });

        return next();
      } catch {
        return res.status(401).json({
          status: false,
          message: "Session expired. Please log in again.",
        });
      }
    }

    const msg =
      err instanceof JsonWebTokenError
        ? "Invalid access token."
        : "Invalid or expired access token.";
    return res.status(401).json({ status: false, message: msg });
  }
};

export const authorize =
  (...allowedRoles: Role[]): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized. Please log in.",
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        status: 403,
        message: `Forbidden: Your role '${user.role}' does not have permission to access this resource.`,
        allowedRoles,
      });
      return;
    }

    return next();
  };

// Map supported roles to their source models for refresh-token validation
const getUserByRole = async (role: Role, id: string) => {
  const modelMap: Partial<Record<Role, any>> = {
    admin: Admin,
    seller: Seller,
    user: User,
    guest: User,
  };
  const Model = modelMap[role];
  return Model ? Model.findById(id) : null;
};
