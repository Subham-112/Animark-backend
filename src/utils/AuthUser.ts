import { Request } from "express";
import ApiError from "./ApiError";

export type AuthenticatedUser = {
  _id: string;
  role: "admin" | "system" | "owner" | "staff" | "user";
};

export const getAuthUser = (
  req: Request,
  allowedRole?: string | string[],
): AuthenticatedUser => {
  const authUser = (req as any).user as AuthenticatedUser | undefined;
  if (!authUser?._id) {
    throw new ApiError(401, "Authentication required");
  }
  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.includes(authUser.role)) {
      throw new ApiError(
        403,
        `Authenticated role ${authUser.role} is not allowed`,
      );
    }
  }
  return authUser;
};
