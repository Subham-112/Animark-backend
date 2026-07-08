import mongoose, { Document, Schema } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongooseDelete = require("mongoose-delete");
import { SellerStatus } from "../common/enum";
import {
  ISoftDeleteDocument,
  ISoftDeleteModel,
} from "../types/softDelete.types";

export const OWNER_GENDER_VALUES = [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
] as const;
export type OwnerGender = (typeof OWNER_GENDER_VALUES)[number];

export interface IOwnerImage {
  url: string;
  key?: string;
  name?: string;
  size?: number;
  mimetype?: string;
  originalname?: string;
}

interface IBranchAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

type PayoutStatus = "pending" | "verified" | "failed";

interface IBankDetails {
  acHolderName: string;
  bankName: string;
  branchAddress: IBranchAddress;
  IFSC_Code: string;

  last4Digits: string; // ✅ safe
  fundAccountId: string; // Razorpay fund_account_id
  status: PayoutStatus;

  createdAt: Date;
  updatedAt: Date;
}

interface IUpiDetails {
  vpa: string; // e.g. rahul@okhdfcbank
  fundAccountId: string; // Razorpay fund_account_id
  status: PayoutStatus;

  createdAt: Date;
  updatedAt: Date;
}

interface ISocialLinks {
  website: String;
  youtube: String;
  instagram: String;
  twitter: String;
  facebook: string;
}

export interface ISeller extends Document, ISoftDeleteDocument {
  firstName: string;
  lastName: string;
  bio: string;
  email: string;
  image?: IOwnerImage | null;
  fcmTokens?: string[];
  phone: string;
  refreshToken?: string;

  bankDetails?: IBankDetails; // ✅ optional
  upiDetails?: IUpiDetails;

  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  displayName?: string;
  status: SellerStatus;
  socialLinks: ISocialLinks;
  createdAt: Date;
  updatedAt: Date;
}

const BankDetailsSchema = new Schema<IBankDetails>(
  {
    acHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    branchAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    IFSC_Code: { type: String, required: true },

    last4Digits: { type: String, required: true },
    fundAccountId: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
  },
  { _id: false, timestamps: true },
);

const UpiDetailsSchema = new Schema<IUpiDetails>(
  {
    vpa: { type: String, required: true },
    fundAccountId: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
  },
  { _id: false, timestamps: true },
);

const SocialLinks = new Schema<ISocialLinks>(
  {
    youtube: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    website: { type: String },
  },
  { _id: false, timestamps: true },
);

const SellerSchema = new Schema<ISeller>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bio: {
      type: String,
      maxlength: 500,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: { type: String, required: true },

    bankDetails: {
      type: BankDetailsSchema,
      required: false,
    },

    upiDetails: {
      type: UpiDetailsSchema,
      required: false,
    },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    image: {
      url: { type: String },
      key: { type: String },
      name: { type: String },
      size: { type: Number },
      mimetype: { type: String },
      originalname: { type: String },
    },
    displayName: { type: String },
    status: {
      type: String,
      enum: Object.values(SellerStatus),
      default: SellerStatus.ACTIVE,
    },

    // Support multiple FCM tokens per owner (devices)
    fcmTokens: { type: [String] },
    refreshToken: { type: String, select: false },
    socialLinks: { type: SocialLinks },
  },
  {
    timestamps: true,
  },
);

SellerSchema.set("toJSON", { virtuals: true });
SellerSchema.set("toObject", { virtuals: true });

SellerSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $ne: true } },
  },
);

SellerSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: { $ne: true } },
  },
);

// Index fcmTokens for faster lookup. Do NOT enforce uniqueness at the schema
// level for array elements (MongoDB cannot enforce uniqueness of array
// elements across documents reliably). Keep the index non-unique and sparse.
SellerSchema.index({ fcmTokens: 1 }, { sparse: true });

SellerSchema.plugin(mongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

export type SellerModel = ISoftDeleteModel<ISeller>;
export const Seller: SellerModel = mongoose.model<ISeller, SellerModel>(
  "Seller",
  SellerSchema,
);
