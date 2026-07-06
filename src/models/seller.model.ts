import mongoose, { Document, Model, Schema, Types } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongooseDelete = require("mongoose-delete");
import {
  KycStatus,
  ServiceMode,
  SellerStatus,
  OnboardingStatus,
  OnboardingStepState,
} from "../common/enum"
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

export interface IOnboardingStep {
  key: string;
  label: string;
  updatedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
  state: OnboardingStepState;
  rejectionReason?: string;
}

export interface IKycDocument {
  _id: Types.ObjectId;
  type: string;
  documentNumber?: string;
  fileUrl: string;
  status: OnboardingStepState;
  submittedAt: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
  metadata?: Record<string, any>;
}

export type OnboardingStepDocument = Types.Subdocument & IOnboardingStep;
export type KycDocumentSubdocument = Types.Subdocument & IKycDocument;

interface IComplianceNote {
  note: string;
  addedBy?: string;
  addedAt: Date;
}

interface IOwnerSettings {
  serviceModes: ServiceMode[];
  autoAcceptOrders: boolean;
  notifyOnReservation: boolean;
  notifyOnNewOrder: boolean;
  lowInventoryThreshold: number;
}

interface IOwnerPreferences {
  cuisineTypes: string[];
  avgOrderValue?: number;
  taxIdentifiers: {
    gstin?: string;
    pan?: string;
  };
  marketplaceOptIn: {
    dineIn: boolean;
    takeaway: boolean;
    delivery: boolean;
  };
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

export interface ISeller extends Document, ISoftDeleteDocument {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gender?: OwnerGender;
  dateOfBirth?: Date | null;
  image?: IOwnerImage | null;
  fcmTokens?: string[];
  phone: string;
  refreshToken?: string;

  bankDetails?: IBankDetails; // ✅ optional
  upiDetails?: IUpiDetails;

  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  companyName?: string;
  onboarding: {
    status: OnboardingStatus;
    currentStep?: string;
    startedAt?: Date;
    completedAt?: Date;
    steps: Types.DocumentArray<OnboardingStepDocument>;
  };
  kyc: {
    status: KycStatus;
    submittedAt?: Date;
    reviewedAt?: Date;
    reviewerId?: string;
    documents: Types.DocumentArray<KycDocumentSubdocument>;
    notes: IComplianceNote[];
  };
  preferences: IOwnerPreferences;
  settings: IOwnerSettings;
  status: SellerStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OnboardingStepSchema = new Schema<IOnboardingStep>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    state: {
      type: String,
      enum: Object.values(OnboardingStepState),
      default: OnboardingStepState.PENDING,
    },
    completedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
    rejectionReason: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const KycDocumentSchema = new Schema<IKycDocument>(
  {
    type: { type: String, required: true },
    documentNumber: { type: String },
    fileUrl: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(OnboardingStepState),
      default: OnboardingStepState.PENDING,
    },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: true },
);

const ComplianceNoteSchema = new Schema<IComplianceNote>(
  {
    note: { type: String, required: true },
    addedBy: { type: String },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

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

const SellerSchema = new Schema<ISeller>(
  {
    firstName: { type: String, required: true },
    role: { type: String, default: "owner" },
    lastName: { type: String, required: true },
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
    gender: {
      type: String,
      enum: OWNER_GENDER_VALUES,
      default: "prefer_not_to_say",
    },
    dateOfBirth: { type: Date },
    image: {
      url: { type: String },
      key: { type: String },
      name: { type: String },
      size: { type: Number },
      mimetype: { type: String },
      originalname: { type: String },
    },
    companyName: { type: String },
    status: {
      type: String,
      enum: Object.values(SellerStatus),
      default: SellerStatus.ACTIVE,
    },
    onboarding: {
      status: {
        type: String,
        enum: Object.values(OnboardingStatus),
        default: OnboardingStatus.NOT_STARTED,
      },
      currentStep: { type: String },
      startedAt: { type: Date },
      completedAt: { type: Date },
      steps: [OnboardingStepSchema],
    },
    kyc: {
      status: {
        type: String,
        enum: Object.values(KycStatus),
        default: KycStatus.NOT_SUBMITTED,
      },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewerId: { type: String },
      documents: [KycDocumentSchema],
      notes: [ComplianceNoteSchema],
    },
    // Support multiple FCM tokens per owner (devices)
    fcmTokens: { type: [String] },
    refreshToken: { type: String, select: false },
    preferences: {
      cuisineTypes: { type: [String], default: [] },
      avgOrderValue: { type: Number },
      taxIdentifiers: {
        gstin: { type: String },
        pan: { type: String },
      },
      marketplaceOptIn: {
        dineIn: { type: Boolean, default: true },
        takeaway: { type: Boolean, default: true },
        delivery: { type: Boolean, default: false },
      },
    },
    settings: {
      serviceModes: {
        type: [String],
        enum: Object.values(ServiceMode),
        default: [ServiceMode.DINE_IN, ServiceMode.TAKEAWAY],
      },
      autoAcceptOrders: { type: Boolean, default: false },
      notifyOnReservation: { type: Boolean, default: true },
      notifyOnNewOrder: { type: Boolean, default: true },
      lowInventoryThreshold: { type: Number, default: 10 },
    },
  },
  {
    timestamps: true,
  },
);
SellerSchema.virtual("shop", {
  ref: "Outlet",
  localField: "_id",
  foreignField: "owner",
  justOne: true,
});

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

SellerSchema.methods.getPendingOnboardingSteps = function (): string[] {
  return this.onboarding.steps
    .filter(
      (step: IOnboardingStep) => step.state !== OnboardingStepState.COMPLETED,
    )
    .map((step: IOnboardingStep) => step.key);
};

export type SellerModel = ISoftDeleteModel<ISeller>;

export const Seller: SellerModel = mongoose.model<
  ISeller,
  SellerModel
>("Seller", SellerSchema);
