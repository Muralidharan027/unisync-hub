
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkIcon, Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export type AnnouncementCategory = 'emergency' | 'important' | 'placement' | 'event' | 'general';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  createdAt: Date;
  createdBy: string;
}

const getCategoryColor = (category: AnnouncementCategory) => {
  switch (category) {
    case 'emergency':
      return 'bg-red-500 hover:bg-red-600';
    case 'important':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'placement':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'event':
      return 'bg-purple-500 hover:bg-purple-600';
    case 'general':
    default:
      return 'bg-green-500 hover:bg-green-600';
  }
};

const getCategoryName = (category: AnnouncementCategory) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

interface AnnouncementCardProps {
  announcement: Announcement;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
}

const AnnouncementCard = ({ announcement, onSave, onShare }: AnnouncementCardProps) => {
  return (
    <Card className="w-full mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge className={getCategoryColor(announcement.category)}>
              {getCategoryName(announcement.category)}
            </Badge>
            <CardTitle className="mt-2 text-xl">{announcement.title}</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        <p>{announcement.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground">
        <span>By {announcement.createdBy}</span>
        <div className="flex gap-2">
          {onSave && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSave(announcement.id)}
              title="Save announcement"
            >
              <BookmarkIcon className="h-4 w-4" />
            </Button>
          )}
          {onShare && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onShare(announcement.id)}
              title="Share announcement"
            >
              <Share2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementCard;
