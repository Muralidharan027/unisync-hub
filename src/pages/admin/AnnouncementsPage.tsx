
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";

export default function AdminAnnouncementsPage() {
  return (
    <DashboardLayout>
      <AnnouncementsList viewMode="admin" />
    </DashboardLayout>
  );
}
