
// Types related to authentication and user profiles

export type UserRole = "student" | "staff" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  student_id?: string;
  staff_id?: string;
  admin_id?: string;
  phone?: string | null;
  avatar_url?: string | null;
}
