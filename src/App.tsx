
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/auth/RoleSelection";
import LoginForm from "./pages/auth/LoginForm";
import DashboardLayout from "./layouts/DashboardLayout";

// Placeholder dashboard components
const StudentDashboard = () => (
  <DashboardLayout role="student">
    <h1 className="text-2xl font-bold">Student Dashboard</h1>
  </DashboardLayout>
);

const StaffDashboard = () => (
  <DashboardLayout role="staff">
    <h1 className="text-2xl font-bold">Staff Dashboard</h1>
  </DashboardLayout>
);

const AdminDashboard = () => (
  <DashboardLayout role="admin">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
  </DashboardLayout>
);

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
          
          {/* Dashboard Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
