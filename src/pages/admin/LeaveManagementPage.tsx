
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";

export default function AdminLeaveManagementPage() {
  return (
    <DashboardLayout>
      <LeaveRequestsList viewMode="admin" />
    </DashboardLayout>
  );
}
