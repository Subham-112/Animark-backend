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