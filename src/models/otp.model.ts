import mongoose, { Document, Schema } from "mongoose";
import { OtpPurpose } from "../common/enum";

export interface IOtp extends Document {
  otp: string;
  mobile?: string;
  email?: string;
  expiresAt: Date;
  verified: boolean;
  purpose: OtpPurpose;
  data: Record<string, any>;
}

const otpSchema = new Schema<IOtp>(
  {
    otp: { type: String, required: true },
    mobile: { type: String, required: false },
    email: { type: String, required: false },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    purpose: {
      type: String,
      enum: Object.values(OtpPurpose),
      required: true,
    },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

// TTL index to auto-delete documents 5 minutes after the 'expiresAt' time
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

// Fast path indexes for OTP verification lookups
otpSchema.index({ mobile: 1, otp: 1, verified: 1, expiresAt: 1 });
otpSchema.index({ email: 1, otp: 1, verified: 1, expiresAt: 1 });

// Fast path indexes for OTP generation / upsert lookups
otpSchema.index({ mobile: 1, verified: 1, expiresAt: 1 });
otpSchema.index({ email: 1, verified: 1, expiresAt: 1 });

otpSchema.pre("save", function () {
  if (!this.mobile && !this.email) {
    new Error("Either mobile or email must be provided");
  }
});

const Otp = mongoose.model<IOtp>("Otp", otpSchema);
export default Otp;
