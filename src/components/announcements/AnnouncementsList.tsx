
import React, { useState, useEffect } from "react";
import { Announcement } from "./AnnouncementCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnnouncementCard from "./AnnouncementCard";
import { FileText, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AnnouncementForm from "./AnnouncementForm";
import { getAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/store/announcements";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AnnouncementCategory } from "./AnnouncementCard";

type AnnouncementsListProps = {
  viewMode?: 'student' | 'staff' | 'admin';
};

const AnnouncementsList = ({ viewMode = 'student' }: AnnouncementsListProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  useEffect(() => {
    // Load announcements
    loadAnnouncements();
  }, [viewMode]);
  
  const loadAnnouncements = () => {
    const allAnnouncements = getAnnouncements();
    
    // Sort by creation date (newest first)
    allAnnouncements.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setAnnouncements(allAnnouncements);
  };
  
  const handleCreateAnnouncement = async (
    title: string, 
    content: string, 
    category: AnnouncementCategory, 
    file?: File
  ) => {
    setIsSubmitting(true);
    
    try {
      // For file handling in a real app, you'd upload the file to storage
      // and get back a URL. Here we'll just use a mock URL if a file is provided
      const fileUrl = file ? URL.createObjectURL(file) : undefined;
      
      // Create a new announcement object
      const newAnnouncement: Announcement = {
        id: editingAnnouncement?.id || uuidv4(),
        title,
        content,
        category,
        createdAt: editingAnnouncement?.createdAt || new Date(),
        createdBy: profile?.full_name || 'Anonymous',
        creatorId: profile?.id,
        fileName: file?.name || editingAnnouncement?.fileName,
        fileUrl: fileUrl || editingAnnouncement?.fileUrl
      };
      
      if (editingAnnouncement) {
        // Update existing announcement
        updateAnnouncement(editingAnnouncement.id, newAnnouncement);
        toast({
          title: "Announcement Updated",
          description: "The announcement has been updated successfully.",
        });
      } else {
        // Add new announcement
        addAnnouncement(newAnnouncement);
        toast({
          title: "Announcement Created",
          description: "The announcement has been created successfully.",
        });
      }
      
      // Update the local state
      loadAnnouncements();
      
      // Close the form and reset editing state
      setIsFormOpen(false);
      setEditingAnnouncement(null);
    } catch (error) {
      console.error("Error creating/updating announcement:", error);
      toast({
        title: "Error",
        description: "Failed to save announcement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditAnnouncement = (id: string) => {
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
      setEditingAnnouncement(announcement);
      setIsFormOpen(true);
    }
  };
  
  const handleDeleteAnnouncement = (id: string) => {
    deleteAnnouncement(id);
    loadAnnouncements();
    toast({
      title: "Announcement Deleted",
      description: "The announcement has been deleted.",
    });
  };
  
  const handleSaveAnnouncement = (id: string) => {
    toast({
      title: "Announcement Saved",
      description: "The announcement has been saved to your bookmarks.",
    });
  };
  
  const handleShareAnnouncement = (id: string) => {
    // In a real application, this would open a share dialog or copy a link
    // For now, we'll just show a toast
    toast({
      title: "Share Link Copied",
      description: "The announcement link has been copied to your clipboard.",
    });
  };
  
  const canCreateAnnouncements = viewMode === 'staff' || viewMode === 'admin';
  
  if (announcements.length === 0) {
    return (
      <div className="space-y-4">
        {canCreateAnnouncements && (
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Announcements</h2>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
                  </DialogTitle>
                </DialogHeader>
                <AnnouncementForm 
                  onSubmit={handleCreateAnnouncement}
                  isSubmitting={isSubmitting}
                  initialData={editingAnnouncement || undefined}
                  isEditing={!!editingAnnouncement}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">No Announcements Found</CardTitle>
            <CardDescription>
              There are no announcements available at the moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {canCreateAnnouncements
                  ? 'Create a new announcement to share with everyone.'
                  : 'Check back later for new announcements.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Announcements</h2>
        {canCreateAnnouncements && (
          <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingAnnouncement(null);
          }}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
                </DialogTitle>
              </DialogHeader>
              <AnnouncementForm 
                onSubmit={handleCreateAnnouncement}
                isSubmitting={isSubmitting}
                initialData={editingAnnouncement || undefined}
                isEditing={!!editingAnnouncement}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {announcements.map((announcement) => (
        <AnnouncementCard 
          key={announcement.id}
          announcement={announcement}
          role={viewMode}
          currentUserId={profile?.id}
          onSave={viewMode === 'student' ? handleSaveAnnouncement : undefined}
          onShare={handleShareAnnouncement}
          onEdit={canCreateAnnouncements ? handleEditAnnouncement : undefined}
          onDelete={canCreateAnnouncements ? handleDeleteAnnouncement : undefined}
        />
      ))}
    </div>
  );
};

export default AnnouncementsList;
