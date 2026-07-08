const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validator = {
  /**
   * Validate Email
   */
  validateEmail(email: string): ValidationResult {
    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        message: "Email is required.",
      };
    }

    if (!emailRegex.test(email.trim().toLowerCase())) {
      return {
        isValid: false,
        message: "Please enter a valid email address.",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate Name
   */
  validateName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
      return {
        isValid: false,
        message: "Name is required.",
      };
    }

    if (name.trim().length < 2) {
      return {
        isValid: false,
        message: "Name must be at least 2 characters long.",
      };
    }

    if (name.trim().length > 50) {
      return {
        isValid: false,
        message: "Name cannot exceed 50 characters.",
      };
    }

    if (!nameRegex.test(name.trim())) {
      return {
        isValid: false,
        message: "Name can only contain letters and spaces.",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate Phone
   */
  validatePhone(phone: string): ValidationResult {
    if (!phone || phone.trim().length === 0) {
      return {
        isValid: false,
        message: "Phone number is required.",
      };
    }

    if (!phoneRegex.test(phone.trim())) {
      return {
        isValid: false,
        message: "Please enter a valid Indian mobile number.",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate Password
   */
  validatePassword(password: string): ValidationResult {
    if (!password) {
      return {
        isValid: false,
        message: "Password is required.",
      };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters long.",
      };
    }

    if (password.length > 64) {
      return {
        isValid: false,
        message: "Password cannot exceed 64 characters.",
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one uppercase letter.",
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter.",
      };
    }

    if (!/\d/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one number.",
      };
    }

    if (!/[@$!%*?&#^()_\-+=]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one special character.",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate OTP
   */
  validateOtp(otp: string): ValidationResult {
    if (!otp) {
      return {
        isValid: false,
        message: "OTP is required.",
      };
    }

    if (!/^\d{6}$/.test(otp)) {
      return {
        isValid: false,
        message: "OTP must be exactly 6 digits.",
      };
    }

    return { isValid: true };
  },

  /**
   * Normalize Email
   */
  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  },

  /**
   * Normalize Phone
   */
  normalizePhone(phone: string): string {
    return phone.trim();
  },

  /**
   * Empty Check
   */
  isEmpty(value?: string): boolean {
    return !value || value.trim().length === 0;
  },

  /**
   * URL Validation
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

export default validator;
