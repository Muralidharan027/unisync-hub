
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";

export default function StudentAnnouncementsPage() {
  return (
    <DashboardLayout>
      <AnnouncementsList viewMode="student" />
    </DashboardLayout>
  );
}
