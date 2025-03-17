
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoleSelection from "./pages/auth/RoleSelection";
import LoginPage from "./pages/auth/LoginPage";
import RoleLoginPage from "./pages/auth/RoleLoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";

// Student Pages
import StudentDashboard from "./pages/student/DashboardPage";
import StudentAnnouncementsPage from "./pages/student/AnnouncementsPage";
import StudentLeaveManagementPage from "./pages/student/LeaveManagementPage";
import StudentSettingsPage from "./pages/student/SettingsPage";

// Staff Pages
import StaffDashboard from "./pages/staff/DashboardPage";
import StaffAnnouncementsPage from "./pages/staff/AnnouncementsPage";
import StaffLeaveManagementPage from "./pages/staff/LeaveManagementPage";
import StaffSettingsPage from "./pages/staff/SettingsPage";

// Admin Pages
import AdminDashboard from "./pages/admin/DashboardPage";
import AdminAnnouncementsPage from "./pages/admin/AnnouncementsPage";
import AdminLeaveManagementPage from "./pages/admin/LeaveManagementPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Homepage */}
            <Route path="/" element={<Index />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<RoleSelection />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/:role/login" element={<RoleLoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            
            {/* Student Routes */}
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/announcements" 
              element={
                <ProtectedRoute role="student">
                  <StudentAnnouncementsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/leave" 
              element={
                <ProtectedRoute role="student">
                  <StudentLeaveManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/settings/*" 
              element={
                <ProtectedRoute role="student">
                  <StudentSettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Staff Routes */}
            <Route 
              path="/staff/dashboard" 
              element={
                <ProtectedRoute role="staff">
                  <StaffDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/announcements" 
              element={
                <ProtectedRoute role="staff">
                  <StaffAnnouncementsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/leave" 
              element={
                <ProtectedRoute role="staff">
                  <StaffLeaveManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/settings/*" 
              element={
                <ProtectedRoute role="staff">
                  <StaffSettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/announcements" 
              element={
                <ProtectedRoute role="admin">
                  <AdminAnnouncementsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/leave" 
              element={
                <ProtectedRoute role="admin">
                  <AdminLeaveManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings/*" 
              element={
                <ProtectedRoute role="admin">
                  <AdminSettingsPage />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route for any unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
