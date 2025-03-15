
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
  // Check for a valid email with gurunanakcollege.edu.in domain 
  // Updated to match format like Sreepriya.s@gurunanakcollege.edu.in
  return validateEmail(email) && 
    (email.endsWith('@college.edu') || 
     email.toLowerCase().endsWith('@gurunanakcollege.edu.in'));
};

/**
 * Validates a password for minimum security requirements
 * @param password The password to validate
 * @returns true if the password meets minimum requirements, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  // Minimum password length of 8 characters
  return password.length >= 8;
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
  if (password.length < 8) return 'weak';
  
  // Check for complexity (numbers, special chars, mixed case)
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  
  if (hasNumbers && hasSpecialChars && hasMixedCase && password.length >= 8) {
    return 'strong';
  } else if ((hasNumbers || hasSpecialChars) && password.length >= 8) {
    return 'medium';
  }
  
  return 'weak';
};
