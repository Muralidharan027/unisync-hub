
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ProfileSettingsProps = {
  role: 'student' | 'staff' | 'admin';
};

export default function ProfileSettings({ role }: ProfileSettingsProps) {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
    id: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profilePicture: profile.avatar_url || '',
        id: profile.student_id || profile.staff_id || profile.admin_id || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user || !profile) {
        throw new Error('User is not authenticated');
      }
      
      // In our mock auth system, we won't actually update Supabase
      // This is just a placeholder for when we have real authentication
      console.log('Would update profile with:', {
        full_name: formData.name,
        phone: formData.phone,
        id_field: formData.id,
      });
      
      // Since we're using mock data, we'll just show a success message
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

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setLoading(true);
    
    try {
      // Since we're using mock data, we'll just simulate a file upload
      console.log('Would upload file:', file.name);
      
      // Update local state with a fake URL to simulate the upload
      const fakeUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, profilePicture: fakeUrl }));
      
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
      setLoading(false);
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
                <label 
                  htmlFor="profile-picture" 
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <User className="h-4 w-4" />
                  <span className="sr-only">Change profile picture</span>
                  <input
                    id="profile-picture"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </label>
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
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Your email cannot be changed after registration.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id">{role === 'student' ? 'Student' : role === 'staff' ? 'Staff' : 'Admin'} ID</Label>
                <Input 
                  id="id" 
                  name="id" 
                  value={formData.id} 
                  onChange={handleChange} 
                  disabled={role === 'student' && !!formData.id} 
                  className={role === 'student' && !!formData.id ? "bg-muted" : ""}
                />
                {role === 'student' && !!formData.id && (
                  <p className="text-xs text-muted-foreground">Student ID cannot be changed once set.</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Update Password</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
