import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import mongoose, { Schema, Document } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongooseDelete = require("mongoose-delete");
import {
  ISoftDeleteDocument,
  ISoftDeleteModel,
} from "../types/softDelete.types";
import { Gender, UserStatus } from "../common/enum";

/* ------------------- Interface ------------------- */
export interface IUser extends Document, ISoftDeleteDocument {
  email: string;
  mobile?: string;
  avatar?: string;
  lastName: string;
  firstName: string;
  countryCode: string;
  password: string;

  // System
  fcmTokens?: string[];
  status: UserStatus;
  lastLoginAt?: Date;
  refreshToken?: string;

  // Compliance
  agreedToTerms: boolean;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  truecallerVerified?: boolean;
  privacyPolicyAccepted: boolean;

  // Notifications
  notifications: {
    sms: boolean;
    push: boolean;
    email: boolean;
    frequency: "immediate" | "daily" | "weekly";
  };

  // Optional
  dateOfBirth?: Date;

  // Methods
  generateJWT(): string;
}

const UserSchema = new Schema<IUser>(
  {
    lastName: { type: String, required: true },
    firstName: { type: String },
    countryCode: { type: String },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    mobile: { type: String },
    avatar: String,
    password: {
      type: String,
      required: true,
      select: false,
    },

    // System
    status: {
      index: true,
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING_VERIFICATION,
    },
    refreshToken: String,
    fcmTokens: { type: [String] },
    lastLoginAt: Date,

    // Compliance
    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    agreedToTerms: { type: Boolean, default: false, required: true },
    privacyPolicyAccepted: { type: Boolean, default: false, required: true },

    // Notifications
    notifications: {
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ["immediate", "daily", "weekly"],
        default: "immediate",
      },
    },

    // Optional
    dateOfBirth: Date,
  },
  { timestamps: true },
);

UserSchema.index({ email: 1, status: 1 });

// Soft-delete compatible unique indexes
UserSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $ne: true } },
  },
);

UserSchema.index(
  { mobile: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $ne: true } },
  },
);

// Index fcmTokens for faster lookup. Do NOT enforce uniqueness at the schema
// level for array elements (MongoDB cannot enforce uniqueness of array
// elements across documents reliably). Keep the index non-unique and sparse.
UserSchema.index({ fcmTokens: 1 }, { sparse: true });

UserSchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

/* ------------------- Utilities ------------------- */
export const generateReferralCode = (ownerId: string) => {
  const prefix = "OWN";
  const randomPart = crypto.randomBytes(2).toString("hex");
  const ownerPart = ownerId.toString().slice(-4);
  return `${prefix}-${randomPart}-${ownerPart}`.toUpperCase();
};

UserSchema.methods.generateJWT = function (): string {
  return jwt.sign({ id: this._id, email: this.email }, config.jwt.secret, {
    expiresIn: "7d",
  });
};

/* ------------------- Export ------------------- */
export type UserModel = ISoftDeleteModel<IUser>;
export const User = mongoose.model<IUser, UserModel>("User", UserSchema);
