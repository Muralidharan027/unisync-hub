
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
    title: "Semester Project Submission",
    content: "All students are requested to submit their semester projects by December 10, 2023. Late submissions will not be accepted.",
    category: "important",
    createdAt: new Date("2023-11-20"),
    createdBy: "Prof. Smith",
  },
  {
    id: "2",
    title: "Class Test Schedule",
    content: "The class test for Operating Systems will be conducted on November 28, 2023. Syllabus includes all topics covered till November 20.",
    category: "general",
    createdAt: new Date("2023-11-15"),
    createdBy: "Prof. Smith",
  },
  {
    id: "3",
    title: "Research Paper Presentation",
    content: "Students interested in presenting research papers at the department seminar should register by November 25, 2023.",
    category: "event",
    createdAt: new Date("2023-11-10"),
    createdBy: "Prof. Johnson",
  },
];

export default function StaffAnnouncementsPage() {
  const [activeTab, setActiveTab] = useState("view");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const tabs = [
    { id: "view", label: "View Announcements", icon: <Bell /> },
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
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage announcements for students.
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
            role="staff"
          />
        ) : (
          <AnnouncementsList 
            announcements={mockAnnouncements.filter(a => a.createdBy === "Prof. Smith")} 
            role="staff"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
