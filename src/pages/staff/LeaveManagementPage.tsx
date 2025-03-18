
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";

export default function StaffLeaveManagementPage() {
  return (
    <DashboardLayout>
      <LeaveRequestsList viewMode="staff" />
    </DashboardLayout>
  );
}
