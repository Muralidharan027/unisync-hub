import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnnouncementCategory } from "./AnnouncementCard";
import { FileIcon, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const categories: { value: AnnouncementCategory; label: string }[] = [
  { value: 'emergency', label: 'Emergency' },
  { value: 'important', label: 'Important' },
  { value: 'placement', label: 'Placement' },
  { value: 'event', label: 'Event' },
  { value: 'general', label: 'General' },
];

interface AnnouncementFormProps {
  onSubmit: (title: string, content: string, category: AnnouncementCategory, file?: File) => void;
  isSubmitting?: boolean;
  initialData?: {
    id: string;
    title: string;
    content: string;
    category: AnnouncementCategory;
    fileName?: string;
  };
  isEditing?: boolean;
}

const AnnouncementForm = ({ 
  onSubmit, 
  isSubmitting = false, 
  initialData, 
  isEditing = false 
}: AnnouncementFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState<AnnouncementCategory>(initialData?.category || 'general');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | undefined>(initialData?.fileName);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for the announcement",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter content for the announcement",
        variant: "destructive",
      });
      return;
    }

    onSubmit(title, content, category, file || undefined);
    
    if (!isEditing) {
      // Clear form after submission (only for new announcements)
      setTitle('');
      setContent('');
      setCategory('general');
      setFile(null);
      setFileName(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Announcement" : "Create Announcement"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category} 
              onValueChange={(value) => setCategory(value as AnnouncementCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Announcement content..."
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (Optional, Max 10MB)</Label>
            <div className="flex flex-col gap-2">
              <Input
                ref={fileInputRef}
                id="attachment"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {fileName ? (
                <div className="flex items-center p-2 border rounded gap-2">
                  <FileIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-sm flex-grow truncate">{fileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Posting..." : isEditing ? "Update Announcement" : "Post Announcement"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AnnouncementForm;
