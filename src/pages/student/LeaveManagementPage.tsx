
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";

export default function StudentLeaveManagementPage() {
  return (
    <DashboardLayout>
      <LeaveRequestsList viewMode="student" />
    </DashboardLayout>
  );
}
