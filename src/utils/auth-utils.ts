
import { UserRole } from "@/types/auth";
import { VALID_STUDENT_IDS } from "@/constants/validation";

// Validate student ID from the list of valid IDs
export const validateStudentId = (studentId: string): boolean => {
  return VALID_STUDENT_IDS.includes(studentId);
};

// Generate role-specific IDs
export const generateRoleId = (role: UserRole): string | undefined => {
  if (role === 'staff') {
    return 'STA' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  } else if (role === 'admin') {
    return 'ADM' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  }
  return undefined;
};
