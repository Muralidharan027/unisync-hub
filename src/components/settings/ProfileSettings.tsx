
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload, User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileSettingsProps {
  role?: 'student' | 'staff' | 'admin';
}

export default function ProfileSettings({ role }: ProfileSettingsProps) {
  const { toast } = useToast();
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dataPersistence, setDataPersistence] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [deleteAvatar, setDeleteAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || "");
      setAvatarUrl(profile.avatar_url || null);
    }
    
    // Load data persistence setting
    const persistenceEnabled = localStorage.getItem("dataPersistenceEnabled");
    setDataPersistence(persistenceEnabled === "true");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // If delete avatar is checked, set avatar_url to null
      const updatedAvatarUrl = deleteAvatar ? null : avatarUrl;
      
      // Delete the avatar file if needed
      if (deleteAvatar && profile?.avatar_url) {
        const filePathMatch = profile.avatar_url.match(/avatars\/([^?]+)/);
        if (filePathMatch && filePathMatch[1]) {
          const filePath = filePathMatch[1];
          await supabase.storage.from('avatars').remove([filePath]);
        }
      }

      await updateProfile({
        full_name: fullName,
        phone,
        email,
        avatar_url: updatedAvatarUrl
      });
      
      if (deleteAvatar) {
        setAvatarUrl(null);
        setDeleteAvatar(false);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved."
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDataPersistenceChange = (checked: boolean) => {
    setDataPersistence(checked);
    localStorage.setItem("dataPersistenceEnabled", checked.toString());
    
    toast({
      title: checked ? "Data persistence enabled" : "Data persistence disabled",
      description: checked 
        ? "Your data will be saved between sessions" 
        : "Your data will be cleared after logging out"
    });
  };

  const getInitials = () => {
    if (!fullName) return "U";
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const userId = profile?.id || 'anonymous';
    const filePath = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setAvatarUrl(data.publicUrl);
        setDeleteAvatar(false);
        
        // Update profile with new avatar URL
        await updateProfile({
          avatar_url: data.publicUrl
        });
        
        toast({
          title: "Avatar updated",
          description: "Your profile photo has been updated."
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile photo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={fullName} />
                  ) : null}
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 flex space-x-1">
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="outline" 
                    className="rounded-full" 
                    onClick={openFileSelector}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                  {avatarUrl && (
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline" 
                      className="rounded-full bg-red-100 hover:bg-red-200" 
                      onClick={() => setDeleteAvatar(!deleteAvatar)}
                    >
                      <Trash2 className={`h-4 w-4 ${deleteAvatar ? 'text-red-600' : 'text-red-400'}`} />
                    </Button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a profile picture (recommended size: 256x256px)
              </p>
              {deleteAvatar && (
                <p className="text-sm text-red-500 font-medium">
                  Your avatar will be deleted when you save changes
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dataPersistence">Keep data after logout</Label>
                <p className="text-sm text-muted-foreground">
                  Announcements and leave requests will be saved even when you log out
                </p>
              </div>
              <Switch
                id="dataPersistence"
                checked={dataPersistence}
                onCheckedChange={handleDataPersistenceChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
