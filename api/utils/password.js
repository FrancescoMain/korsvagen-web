/**
 * Password Utilities
 * Handles password hashing, validation, and strength checking
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a password
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error("Error comparing password: " + error.message);
  }
};

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!hasNumbers) {
    errors.push("Password must contain at least one number");
  }

  if (!hasSpecialChar) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
};

/**
 * Calculate password strength score (0-100)
 */
const calculatePasswordStrength = (password) => {
  let score = 0;

  // Length bonus
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;

  // Character variety bonus
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  // Pattern penalties
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 15; // Common sequences

  return Math.max(0, Math.min(100, score));
};

/**
 * Generate secure random password
 */
export const generateSecurePassword = (length = 16) => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + symbols;
  let password = "";

  // Ensure at least one of each type
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};
