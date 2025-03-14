import { useState } from "react";
import { Input } from "@/components/ui/input";
import AnnouncementCard, { Announcement, AnnouncementCategory } from "./AnnouncementCard";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AnnouncementForm from "./AnnouncementForm";

interface AnnouncementsListProps {
  announcements: Announcement[];
  role: 'student' | 'staff' | 'admin';
  onSave?: (id: string) => void;
  onUpdate?: (id: string, data: Partial<Announcement>) => void;
  onDelete?: (id: string) => void;
}

const AnnouncementsList = ({ 
  announcements, 
  role, 
  onSave, 
  onUpdate,
  onDelete 
}: AnnouncementsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<AnnouncementCategory | ''>('');
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleSaveAnnouncement = (id: string) => {
    if (onSave) {
      onSave(id);
    } else {
      // In a real app, this would save to the user's preferences
      toast({
        title: "Announcement saved",
        description: "The announcement has been saved to your bookmarks",
      });
    }
  };

  const handleShareAnnouncement = (id: string) => {
    // In a real app, this would handle sharing functionality
    navigator.clipboard.writeText(`UniSync Announcement #${id}`);
    toast({
      title: "Link copied",
      description: "Announcement link copied to clipboard",
    });
  };
  
  const handleEditAnnouncement = (id: string) => {
    setEditingAnnouncementId(id);
  };
  
  const handleUpdateAnnouncement = (
    title: string, 
    content: string, 
    category: AnnouncementCategory,
    file?: File
  ) => {
    if (editingAnnouncementId && onUpdate) {
      // Prepare file data if provided
      let fileData = {};
      if (file) {
        // In a real app, we would upload the file to storage and get URL
        // For demo, create an object URL
        const fileUrl = URL.createObjectURL(file);
        fileData = {
          fileUrl,
          fileName: file.name
        };
      }
      
      onUpdate(editingAnnouncementId, {
        title,
        content,
        category,
        ...fileData
      });
      
      setEditingAnnouncementId(null);
      
      toast({
        title: "Announcement updated",
        description: "Your announcement has been updated successfully",
      });
    }
  };

  const clearFilter = () => {
    setFilterCategory('');
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory ? announcement.category === filterCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  const categories: AnnouncementCategory[] = ['emergency', 'important', 'placement', 'event', 'general'];
  
  // Find the announcement being edited
  const announcementBeingEdited = editingAnnouncementId 
    ? announcements.find(a => a.id === editingAnnouncementId) 
    : undefined;

  return (
    <div className="space-y-4">
      {editingAnnouncementId && announcementBeingEdited ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setEditingAnnouncementId(null)}
          >
            Cancel Editing
          </Button>
          
          <AnnouncementForm 
            onSubmit={handleUpdateAnnouncement}
            isEditing={true}
            initialData={{
              id: announcementBeingEdited.id,
              title: announcementBeingEdited.title,
              content: announcementBeingEdited.content,
              category: announcementBeingEdited.category,
              fileName: announcementBeingEdited.fileName
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-1"
                aria-label="Filter by category"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
              
              <div className="flex gap-1 flex-wrap">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    className={`cursor-pointer ${filterCategory === category ? 'bg-primary' : 'bg-secondary'}`}
                    onClick={() => setFilterCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                ))}
                
                {filterCategory && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer flex items-center gap-1"
                    onClick={clearFilter}
                  >
                    Clear <X className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No announcements found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onSave={onSave ? handleSaveAnnouncement : undefined}
                  onShare={handleShareAnnouncement}
                  onEdit={onUpdate ? handleEditAnnouncement : undefined}
                  onDelete={onDelete}
                  currentUserId={profile?.id}
                  role={role}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnnouncementsList;
