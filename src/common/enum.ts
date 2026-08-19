export enum ServiceMode {
  DINE_IN = "dine_in",
  TAKEAWAY = "takeaway",
  DELIVERY = "delivery",
}

export enum OnboardingStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  PAUSED = "paused",
}

export enum OnboardingStepState {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  SKIPPED = "skipped",
  REJECTED = "rejected",
}

export enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  NEEDS_RESUBMISSION = "needs_resubmission",
}

export enum SellerStatus {
  PENDING = "pending",
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

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

export enum OtpPurpose {
  REGISTER = "register",
  LOGIN = "login",
  FORGOT_PASSWORD = "forgot_password"
}

export enum CookiesNames {
  USER_ACCESS = "user_access",
  USER_REFRESH = "user_refresh",
  SELLER_ACCESS = "seller_access",
  SELLER_REFRESH = "seller_refresh",
  ADMIN_ACCESS = "admin_access",
  ADMIN_REFRESH = "admin_refresh"
}

export enum Roles {
  USER = "user",
  SELLER = "seller",
  ADMIN = "admin"
}

export enum CommonStatus {
  ACTIVE = "active",
  INACTIVE = "inactive"
}

export enum ProductOwnerType {
  OWNER = "owner",
  SYSTEM = "system"
}

export enum LicenceType {
  PERSONAL = "personal",
  COMMERCIAL = "commercial"
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}