
import { useState } from "react";
import { Input } from "@/components/ui/input";
import AnnouncementCard, { Announcement, AnnouncementCategory } from "./AnnouncementCard";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";

interface AnnouncementsListProps {
  announcements: Announcement[];
  role: 'student' | 'staff' | 'admin';
}

const AnnouncementsList = ({ announcements, role }: AnnouncementsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<AnnouncementCategory | ''>('');
  const { toast } = useToast();

  const handleSaveAnnouncement = (id: string) => {
    // In a real app, this would save to the user's preferences
    toast({
      title: "Announcement saved",
      description: "The announcement has been saved to your bookmarks",
    });
  };

  const handleShareAnnouncement = (id: string) => {
    // In a real app, this would handle sharing functionality
    navigator.clipboard.writeText(`UniSync Announcement #${id}`);
    toast({
      title: "Link copied",
      description: "Announcement link copied to clipboard",
    });
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

  return (
    <div className="space-y-4">
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
              onSave={role === 'student' ? handleSaveAnnouncement : undefined}
              onShare={handleShareAnnouncement}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsList;
