
import { useState, useEffect } from "react";
import { Bell, BookOpen } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";
import { Announcement } from "@/components/announcements/AnnouncementCard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { getAnnouncements } from "@/store/announcements";

export default function StudentAnnouncementsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [savedAnnouncements, setSavedAnnouncements] = useState<Announcement[]>([]);
  const { toast } = useToast();
  
  const tabs = [
    { id: "all", label: "All Announcements", icon: <Bell /> },
    { id: "saved", label: "Saved", icon: <BookOpen /> },
  ];
  
  // Initial load and polling for announcements updates
  useEffect(() => {
    // Initial load
    setAnnouncements(getAnnouncements());
    
    // Poll for updates
    const interval = setInterval(() => {
      setAnnouncements(getAnnouncements());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Load saved announcements from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedAnnouncements');
    if (saved) {
      try {
        const savedIds = JSON.parse(saved) as string[];
        const savedAnns = announcements.filter(a => savedIds.includes(a.id));
        setSavedAnnouncements(savedAnns);
      } catch (error) {
        console.error('Error parsing saved announcements:', error);
      }
    }
  }, [announcements]);
  
  const handleSaveAnnouncement = (id: string) => {
    const announcement = announcements.find(a => a.id === id);
    if (!announcement) return;
    
    // Get current saved announcement IDs
    const savedJson = localStorage.getItem('savedAnnouncements');
    let savedIds: string[] = [];
    
    if (savedJson) {
      try {
        savedIds = JSON.parse(savedJson);
      } catch (error) {
        console.error('Error parsing saved announcements:', error);
      }
    }
    
    // Check if already saved
    if (savedIds.includes(id)) {
      // Remove from saved
      savedIds = savedIds.filter(savedId => savedId !== id);
      toast({
        title: "Announcement unsaved",
        description: "The announcement has been removed from your bookmarks",
      });
    } else {
      // Add to saved
      savedIds.push(id);
      toast({
        title: "Announcement saved",
        description: "The announcement has been saved to your bookmarks",
      });
    }
    
    // Save back to localStorage
    localStorage.setItem('savedAnnouncements', JSON.stringify(savedIds));
    
    // Update saved announcements
    setSavedAnnouncements(announcements.filter(a => savedIds.includes(a.id)));
  };
  
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
            announcements={announcements} 
            role="student"
            onSave={handleSaveAnnouncement}
          />
        ) : (
          <AnnouncementsList 
            announcements={savedAnnouncements} 
            role="student"
            onSave={handleSaveAnnouncement}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
