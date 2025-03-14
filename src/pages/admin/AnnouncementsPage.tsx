import { useState, useEffect } from "react";
import { Bell, FilePlus, History } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import { Announcement, AnnouncementCategory } from "@/components/announcements/AnnouncementCard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from "@/store/announcements";

export default function AdminAnnouncementsPage() {
  const [activeTab, setActiveTab] = useState("view");
  const [submitting, setSubmitting] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const tabs = [
    { id: "view", label: "All Announcements", icon: <Bell /> },
    { id: "create", label: "Create New", icon: <FilePlus /> },
    { id: "history", label: "My Announcements", icon: <History /> },
  ];
  
  useEffect(() => {
    setAnnouncements(getAnnouncements());
    
    const interval = setInterval(() => {
      setAnnouncements(getAnnouncements());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSubmitAnnouncement = (
    title: string, 
    content: string, 
    category: AnnouncementCategory,
    file?: File
  ) => {
    setSubmitting(true);
    
    setTimeout(() => {
      let fileData = {};
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        fileData = {
          fileUrl,
          fileName: file.name
        };
      }
      
      const newAnnouncement: Announcement = {
        id: `announcement-${Date.now()}`,
        title,
        content,
        category,
        createdAt: new Date(),
        createdBy: profile?.full_name || "Admin User",
        creatorId: profile?.id,
        ...fileData
      };
      
      addAnnouncement(newAnnouncement);
      
      setAnnouncements(getAnnouncements());
      
      setSubmitting(false);
      toast({
        title: "Announcement Posted",
        description: "Your announcement has been posted successfully.",
      });
      
      setActiveTab("view");
    }, 1500);
  };
  
  const handleUpdateAnnouncement = (id: string, updatedData: Partial<Announcement>) => {
    updateAnnouncement(id, updatedData);
    
    setAnnouncements(getAnnouncements());
  };
  
  const handleDeleteAnnouncement = (id: string) => {
    deleteAnnouncement(id);
    
    setAnnouncements(getAnnouncements());
    
    toast({
      title: "Announcement Deleted",
      description: "The announcement has been deleted successfully.",
    });
  };
  
  const myAnnouncements = announcements.filter(a => a.creatorId === profile?.id);
  
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
            announcements={announcements} 
            role="admin"
            onUpdate={handleUpdateAnnouncement}
            onDelete={handleDeleteAnnouncement}
          />
        ) : (
          <AnnouncementsList 
            announcements={myAnnouncements} 
            role="admin"
            onUpdate={handleUpdateAnnouncement}
            onDelete={handleDeleteAnnouncement}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
