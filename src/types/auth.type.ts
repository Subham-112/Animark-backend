import { IOwnerImage, ISocialLinks } from "../models/seller.model";

export interface UserRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface SellerApplyPayload {
  displayName: string;
  bio?: string;

  socialLinks: {
    website?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}


export interface UpdateSellerProfilePayload {
  displayName?: string;
  bio?: string;
  image?: IOwnerImage | null;
  socialLinks?: Partial<ISocialLinks>;
}
