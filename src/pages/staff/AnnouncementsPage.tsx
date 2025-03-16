
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { AnnouncementsList } from "@/components/announcements/AnnouncementsList";

export default function StaffAnnouncementsPage() {
  return (
    <DashboardLayout>
      <AnnouncementsList viewMode="staff" />
    </DashboardLayout>
  );
}
