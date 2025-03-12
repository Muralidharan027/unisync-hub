
import { useState } from "react";
import { Bell, FilePlus, History } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import { Announcement, AnnouncementCategory } from "@/components/announcements/AnnouncementCard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

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
    title: "Campus Power Shutdown",
    content: "There will be a scheduled power shutdown on campus on November 20th from 10 AM to 2 PM for maintenance work.",
    category: "emergency",
    createdAt: new Date("2023-11-18"),
    createdBy: "Campus Administrator",
  },
];

export default function AdminAnnouncementsPage() {
  const [activeTab, setActiveTab] = useState("view");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const tabs = [
    { id: "view", label: "All Announcements", icon: <Bell /> },
    { id: "create", label: "Create New", icon: <FilePlus /> },
    { id: "history", label: "My Announcements", icon: <History /> },
  ];
  
  const handleSubmitAnnouncement = (title: string, content: string, category: AnnouncementCategory) => {
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Announcement Posted",
        description: "Your announcement has been posted successfully.",
      });
      
      // Switch to view tab after successful submission
      setActiveTab("view");
    }, 1500);
  };
  
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage all institution announcements.
          </p>
        </div>
        
        <ModuleTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === "create" ? (
          <AnnouncementForm 
            onSubmit={handleSubmitAnnouncement}
            isSubmitting={submitting}
          />
        ) : activeTab === "view" ? (
          <AnnouncementsList 
            announcements={mockAnnouncements} 
            role="admin"
          />
        ) : (
          <AnnouncementsList 
            announcements={mockAnnouncements.filter(a => a.createdBy === "Campus Administrator")} 
            role="admin"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
