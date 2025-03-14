
import { VALID_STUDENT_IDS } from "@/contexts/AuthContext";

/**
 * Validates a student ID against the list of valid student IDs
 * @param studentId The student ID to validate
 * @returns true if the ID is valid, false otherwise
 */
export const validateStudentId = (studentId: string): boolean => {
  return VALID_STUDENT_IDS.includes(studentId);
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
 * Validates a password for minimum security requirements
 * @param password The password to validate
 * @returns true if the password meets minimum requirements, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  // Minimum password length of 6 characters
  return password.length >= 6;
};
