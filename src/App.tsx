
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/auth/RoleSelection";
import LoginForm from "./pages/auth/LoginForm";

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
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          
          {/* Auth Routes */}
          <Route path="/auth/student/login" element={<LoginForm role="student" />} />
          <Route path="/auth/staff/login" element={<LoginForm role="staff" />} />
          <Route path="/auth/admin/login" element={<LoginForm role="admin" />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/announcements" element={<StudentAnnouncementsPage />} />
          <Route path="/student/leave" element={<StudentLeaveManagementPage />} />
          <Route path="/student/settings/:section" element={<StudentSettingsPage />} />
          <Route path="/student/settings" element={<StudentSettingsPage />} />
          
          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/announcements" element={<StaffAnnouncementsPage />} />
          <Route path="/staff/leave" element={<StaffLeaveManagementPage />} />
          <Route path="/staff/settings/:section" element={<StaffSettingsPage />} />
          <Route path="/staff/settings" element={<StaffSettingsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
          <Route path="/admin/leave" element={<AdminLeaveManagementPage />} />
          <Route path="/admin/settings/:section" element={<AdminSettingsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
