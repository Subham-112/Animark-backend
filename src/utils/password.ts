import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hash Password
 */
export const hashPassword = async (
  password: string,
): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare Password
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate Password Hash
 * (Alias for better readability)
 */
export const generatePasswordHash = hashPassword;

/**
 * Verify Password
 * (Alias for better readability)
 */
export const verifyPassword = comparePassword;