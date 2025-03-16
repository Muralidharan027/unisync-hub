
import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { validatePhoneNumber, validatePasswordMatch } from '@/utils/validation';
import { v4 as uuidv4 } from 'uuid';

type ProfileSettingsProps = {
  role: 'student' | 'staff' | 'admin';
};

export default function ProfileSettings({ role }: ProfileSettingsProps) {
  const { profile, user, updatePassword: authUpdatePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    profilePicture: '',
    id: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [persistData, setPersistData] = useState(() => {
    return localStorage.getItem('persistUserData') === 'true';
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        department: profile.department || '',
        profilePicture: profile.avatar_url || '',
        id: profile.student_id || profile.staff_id || profile.admin_id || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePersistDataToggle = async (checked: boolean) => {
    setPersistData(checked);
    localStorage.setItem('persistUserData', checked.toString());
    
    try {
      // Update user metadata with persistence preference
      if (user) {
        await supabase
          .from('profiles')
          .update({ persist_data: checked })
          .eq('id', user.id);
      }
      
      toast({
        title: checked ? "Data persistence enabled" : "Data persistence disabled",
        description: checked 
          ? "Your data will now be saved between sessions" 
          : "Your data will no longer be saved between sessions",
      });
    } catch (error) {
      console.error("Error updating data persistence:", error);
      toast({
        title: "Error",
        description: "Failed to update data persistence settings",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user || !profile) {
        throw new Error('User is not authenticated');
      }
      
      // Phone number validation
      if (formData.phone && !validatePhoneNumber(formData.phone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name,
          phone: formData.phone,
          department: formData.department,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: error.message || 'An error occurred while updating your profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user) {
        throw new Error('User is not authenticated');
      }
      
      // Validate passwords
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        throw new Error('Please fill in all password fields');
      }
      
      if (passwordData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      
      if (!validatePasswordMatch(passwordData.newPassword, passwordData.confirmPassword)) {
        throw new Error('New password and confirmation do not match');
      }
      
      // Update password through the Auth context
      await authUpdatePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Clear password fields after successful update
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error updating password',
        description: error.message || 'An error occurred while updating your password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setAvatarLoading(true);
    
    try {
      // Generate a unique filename to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded image
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const publicUrl = data.publicUrl;
      
      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Update local state with the new URL
      setFormData(prev => ({ ...prev, profilePicture: publicUrl }));
      
      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      toast({
        title: 'Error updating profile picture',
        description: error.message || 'An error occurred while updating your profile picture',
        variant: 'destructive',
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and how others see you on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {formData.profilePicture ? (
                    <AvatarImage src={formData.profilePicture} alt={formData.name} />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {formData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <button 
                  type="button"
                  onClick={triggerFileInput}
                  disabled={avatarLoading}
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  <User className="h-4 w-4" />
                  <span className="sr-only">Change profile picture</span>
                  <input
                    ref={fileInputRef}
                    id="profile-picture"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={avatarLoading}
                  />
                </button>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-lg font-medium">{formData.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
                <p className="text-xs text-muted-foreground">{role.charAt(0).toUpperCase() + role.slice(1)} • {formData.id || 'No ID set'}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="10-digit phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  placeholder="Your department" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id">{role === 'student' ? 'Student' : role === 'staff' ? 'Staff' : 'Admin'} ID</Label>
                <Input 
                  id="id" 
                  name="id" 
                  value={formData.id} 
                  onChange={handleChange} 
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">ID cannot be changed once set.</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="persist-data">Data Persistence</Label>
                  <p className="text-sm text-muted-foreground">Keep your data synced between sessions and devices</p>
                </div>
                <Switch 
                  id="persist-data" 
                  checked={persistData} 
                  onCheckedChange={handlePersistDataToggle}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || avatarLoading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <form onSubmit={handlePasswordSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword"
                name="currentPassword" 
                type="password" 
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                name="newPassword"
                type="password" 
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
