
import { useState } from "react";
import { Bell, BookOpen } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";
import { Announcement } from "@/components/announcements/AnnouncementCard";
import DashboardLayout from "@/layouts/DashboardLayout";

// Mock data for announcements
const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "End Semester Examination Schedule",
    content: "The end semester examination schedule has been released. Please check the college website for details.",
    category: "important",
    createdAt: new Date("2023-11-15"),
    createdBy: "Examination Controller",
  },
  {
    id: "2",
    title: "Campus Placement Drive",
    content: "TCS is conducting a placement drive on 25th November 2023. All eligible students must register by 20th November.",
    category: "placement",
    createdAt: new Date("2023-11-10"),
    createdBy: "Placement Officer",
  },
  {
    id: "3",
    title: "College Cultural Festival",
    content: "The annual cultural festival 'Rhythm' will be held from December 10-12, 2023. Registrations for various competitions are now open.",
    category: "event",
    createdAt: new Date("2023-11-05"),
    createdBy: "Cultural Secretary",
  },
  {
    id: "4",
    title: "Library Timing Change",
    content: "The library will be open from 8 AM to 10 PM from 1st December 2023 onwards due to examination preparation period.",
    category: "general",
    createdAt: new Date("2023-10-28"),
    createdBy: "Chief Librarian",
  },
  {
    id: "5",
    title: "Campus Power Shutdown",
    content: "There will be a scheduled power shutdown on campus on November 20th from 10 AM to 2 PM for maintenance work.",
    category: "emergency",
    createdAt: new Date("2023-11-18"),
    createdBy: "Campus Administrator",
  },
];

// Mock data for saved announcements (by this student)
const mockSavedAnnouncements: Announcement[] = [
  mockAnnouncements[1], // Placement announcement
  mockAnnouncements[4], // Emergency announcement
];

export default function StudentAnnouncementsPage() {
  const [activeTab, setActiveTab] = useState("all");
  
  const tabs = [
    { id: "all", label: "All Announcements", icon: <Bell /> },
    { id: "saved", label: "Saved", icon: <BookOpen /> },
  ];
  
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            View and manage important announcements from your institution.
          </p>
        </div>
        
        <ModuleTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === "all" ? (
          <AnnouncementsList 
            announcements={mockAnnouncements} 
            role="student"
          />
        ) : (
          <AnnouncementsList 
            announcements={mockSavedAnnouncements} 
            role="student"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
