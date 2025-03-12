
import { useState } from "react";
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

const categories: { value: AnnouncementCategory; label: string }[] = [
  { value: 'emergency', label: 'Emergency' },
  { value: 'important', label: 'Important' },
  { value: 'placement', label: 'Placement' },
  { value: 'event', label: 'Event' },
  { value: 'general', label: 'General' },
];

interface AnnouncementFormProps {
  onSubmit: (title: string, content: string, category: AnnouncementCategory) => void;
  isSubmitting?: boolean;
}

const AnnouncementForm = ({ onSubmit, isSubmitting = false }: AnnouncementFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('general');
  const { toast } = useToast();

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

    onSubmit(title, content, category);
    
    // Clear form after submission
    setTitle('');
    setContent('');
    setCategory('general');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Announcement</CardTitle>
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
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Posting..." : "Post Announcement"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AnnouncementForm;
