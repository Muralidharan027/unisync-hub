
/**
 * Validates a student register number
 * @param registerNumber The register number to validate
 * @returns true if the register number is valid (exactly 13 digits), false otherwise
 */
export const validateRegisterNumber = (registerNumber: string): boolean => {
  // Register number must be exactly 13 digits
  return /^\d{13}$/.test(registerNumber);
};

/**
 * Validates an email address
 * @param email The email to validate
 * @returns true if the email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a college domain email for staff and admin
 * @param email The email to validate
 * @returns true if the email has a valid college domain, false otherwise
 */
export const validateCollegeDomainEmail = (email: string): boolean => {
  // This would be customized to check for your specific college domain
  // For example: return /^[^\s@]+@college\.edu$/.test(email);
  // For testing purposes, we'll accept any valid email
  return validateEmail(email);
};

/**
 * Validates a password for minimum security requirements
 * @param password The password to validate
 * @returns true if the password meets minimum requirements, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  // Minimum password length of 6 characters
  return password.length >= 6;
};

/**
 * Validates a student ID against the list of valid student IDs
 * @param studentId The student ID to validate
 * @returns true if the ID is valid, false otherwise
 */
export const validateStudentId = (studentId: string): boolean => {
  // Accept any 13-digit number as valid
  return /^\d{13}$/.test(studentId);
};

/**
 * Calculate password strength
 * @param password The password to evaluate
 * @returns 'weak' | 'medium' | 'strong' based on password complexity
 */
export const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  
  // Check for complexity (numbers, special chars, mixed case)
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  
  if (hasNumbers && hasSpecialChars && hasMixedCase && password.length >= 8) {
    return 'strong';
  } else if ((hasNumbers || hasSpecialChars) && password.length >= 6) {
    return 'medium';
  }
  
  return 'weak';
};
