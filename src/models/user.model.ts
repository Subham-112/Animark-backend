import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import mongoose, { Schema, Document, Types } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongooseDelete = require("mongoose-delete");
import { ISoftDeleteDocument, ISoftDeleteModel } from "../types/softDelete.types";

/* ------------------- Enums ------------------- */
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  DEACTIVATED = "deactivated",
  PENDING_VERIFICATION = "pending_verification",
}

export enum Gender {
  MALE = "male",
  OTHER = "other",
  FEMALE = "female",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum AccountVerificationType {
  PAN = "Pan",
  AADHAAR = "Aadhaar",
  VOTER_ID = "Voter Id",
}

/* ------------------- Interface ------------------- */
export interface IUser extends Document, ISoftDeleteDocument {
  bio?: string;
  role: string;
  email: string;
  mobile: string;
  gender?: Gender;
  avatar?: string;
  rating?: number;
  lastName: string;
  firstName: string;
  countryCode: string;

  // KYC / Business
  pan?: string;
  gstin?: string;
  accountVerificationPhoto?: string;
  accountVerificationDocument?: string;
  accountVerificationId?: AccountVerificationType;
  verificationStatus: "pending" | "verified" | "not-verified";

  // System
  fcmTokens?: string[];
  status: UserStatus;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  refreshToken?: string;

  // Compliance
  truecallerId?: string;
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

  checkedInOutlet?: {
    id: Types.ObjectId | null;
    name: string | null;
    session: Types.ObjectId | null;
  };

  // Optional
  dateOfBirth?: Date;
  address?: IUserAddress;

  // Methods
  generateJWT(): string;
}

export interface IUserAddress {
  label?: string;
  line1?: string;
  line2?: string;
  area?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  geoLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
}

/* ------------------- Schema ------------------- */
const GeoLocationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: undefined,
      validate: {
        validator(value: number[] | undefined) {
          return !value || value.length === 2;
        },
        message: "geoLocation.coordinates must be an array of [lng, lat]",
      },
    },
  },
  { _id: false }
);

const UserAddressSchema = new Schema<IUserAddress>(
  {
    label: { type: String, trim: true },
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    area: { type: String, trim: true },
    landmark: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    geoLocation: {
      type: GeoLocationSchema,
      default: undefined,
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    lastName: { type: String, required: true },
    firstName: { type: String },
    role: { type: String, default: "user" },
    countryCode: { type: String },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    mobile: { type: String, required: true },
    bio: String,
    avatar: String,
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.PREFER_NOT_TO_SAY,
    },
    rating: { type: Number, min: 1, max: 5 },

    // KYC / Business
    pan: String,
    gstin: String,
    accountVerificationPhoto: String,
    accountVerificationId: {
      type: String,
      enum: Object.values(AccountVerificationType),
    },
    accountVerificationDocument: String,
    verificationStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "verified", "not-verified"],
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
    lastActiveAt: Date,

    // Compliance
    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    agreedToTerms: { type: Boolean, default: false, required: true },
    privacyPolicyAccepted: { type: Boolean, default: false, required: true },

    // Truecaller
    truecallerVerified: { type: Boolean, default: false },
    truecallerId: String,

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

    checkedInOutlet: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Outlet",
        default: null
      },
      name: {
        type: String,
        default: null
      },
      session: {
        type: Schema.Types.ObjectId,
        ref: "CheckInSession",
        default: null
      }
    },

    // Optional
    dateOfBirth: Date,
    address: { type: UserAddressSchema, default: undefined },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, status: 1 });
UserSchema.index({ "address.geoLocation": "2dsphere" });

UserSchema.index({ "checkedInOutlet.id": 1 });
UserSchema.index({ "checkedInOutlet.id": 1, "_id": 1 });

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

// Wiskeys related indexes
UserSchema.index({
  "progression.currentLevel": -1,
  "progression.currentXP": -1,
});

UserSchema.index({
  "progression.totalXP": -1,
  "wiskeys.lifeTimeEarned": -1,
});

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
