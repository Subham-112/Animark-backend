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
  INACTIVE = "inactive",
  ACTIVE = "active",
  SUSPENDED = "suspended",
}