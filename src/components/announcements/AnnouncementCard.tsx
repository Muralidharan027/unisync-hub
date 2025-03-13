
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkIcon, Share2Icon, FileIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export type AnnouncementCategory = 'emergency' | 'important' | 'placement' | 'event' | 'general';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  createdAt: Date;
  createdBy: string;
  fileUrl?: string;
  fileName?: string;
  creatorId?: string;
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
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
  role: 'student' | 'staff' | 'admin';
}

const AnnouncementCard = ({ 
  announcement, 
  onSave, 
  onShare, 
  onEdit, 
  onDelete,
  currentUserId,
  role 
}: AnnouncementCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const canModify = 
    role === 'admin' || 
    (role === 'staff' && announcement.creatorId === currentUserId);

  const handleDownloadFile = () => {
    if (announcement.fileUrl) {
      const a = document.createElement('a');
      a.href = announcement.fileUrl;
      a.download = announcement.fileName || 'announcement_attachment';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
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
        
        {announcement.fileName && (
          <div className="mt-4 p-2 border rounded flex items-center gap-2 bg-slate-50">
            <FileIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm flex-grow truncate">{announcement.fileName}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDownloadFile}
              disabled={!announcement.fileUrl}
            >
              Download
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground">
        <span>By {announcement.createdBy}</span>
        <div className="flex gap-2">
          {onSave && role === 'student' && (
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
          
          {onEdit && canModify && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(announcement.id)}
              title="Edit announcement"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          
          {onDelete && canModify && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  title="Delete announcement"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this announcement. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      onDelete(announcement.id);
                      setIsDeleteDialogOpen(false);
                    }}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementCard;
