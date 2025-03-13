
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [availableIds, setAvailableIds] = useState<{ id: string; student_id: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  
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
    
    // Fetch available student IDs if user is a student and doesn't have an ID yet
    if (role === 'student' && profile && !profile.student_id) {
      fetchAvailableStudentIds();
    }
  }, [profile, role]);

  const fetchAvailableStudentIds = async () => {
    try {
      const { data, error } = await supabase
        .from('available_student_ids')
        .select('id, student_id')
        .eq('is_claimed', false);
        
      if (error) throw error;
      
      setAvailableIds(data || []);
    } catch (error) {
      console.error('Error fetching available student IDs:', error);
      toast({
        title: 'Error',
        description: 'Could not load available student IDs',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClaimStudentId = async () => {
    if (!selectedId || !user) return;
    
    setLoading(true);
    
    try {
      // Start a transaction
      // 1. Mark the ID as claimed in the available_student_ids table
      const { error: claimError } = await supabase
        .from('available_student_ids')
        .update({ 
          is_claimed: true,
          claimed_by: user.id 
        })
        .eq('id', selectedId);
        
      if (claimError) throw claimError;
      
      // 2. Get the student_id value from the selected ID
      const { data: idData, error: idError } = await supabase
        .from('available_student_ids')
        .select('student_id')
        .eq('id', selectedId)
        .single();
        
      if (idError) throw idError;
      
      // 3. Update the profile with the claimed student ID
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          student_id: idData.student_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Update local state
      setFormData(prev => ({ ...prev, id: idData.student_id }));
      
      toast({
        title: 'Success',
        description: `Student ID ${idData.student_id} has been assigned to your profile`,
      });
      
    } catch (error: any) {
      console.error('Error claiming student ID:', error);
      toast({
        title: 'Error claiming student ID',
        description: error.message || 'An error occurred while claiming the student ID',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user || !profile) {
        throw new Error('User is not authenticated');
      }
      
      // Determine the ID field based on user role
      const idField = role === 'student' ? 'student_id' : 
                      role === 'staff' ? 'staff_id' : 'admin_id';
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name,
          phone: formData.phone,
          [idField]: formData.id,
          updated_at: new Date().toISOString(),
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

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setLoading(true);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const avatarUrl = data.publicUrl;
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setFormData(prev => ({ ...prev, profilePicture: avatarUrl }));
      
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

  // Function to render the student ID section based on whether the user has an ID already
  const renderStudentIdSection = () => {
    if (role !== 'student') {
      return (
        <div className="space-y-2">
          <Label htmlFor="id">{role === 'staff' ? 'Staff' : 'Admin'} ID</Label>
          <Input 
            id="id" 
            name="id" 
            value={formData.id} 
            onChange={handleChange} 
          />
        </div>
      );
    }
    
    // For students with an existing ID
    if (formData.id) {
      return (
        <div className="space-y-2">
          <Label htmlFor="id">Student ID</Label>
          <Input 
            id="id" 
            name="id" 
            value={formData.id} 
            readOnly 
            className="bg-gray-100 border border-gray-300" 
          />
          <p className="text-xs text-muted-foreground">Your student ID cannot be changed.</p>
        </div>
      );
    }
    
    // For students without an ID yet
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student-id-select">Select a Student ID</Label>
          <div className="flex flex-col space-y-2">
            <Select onValueChange={setSelectedId} value={selectedId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an available ID" />
              </SelectTrigger>
              <SelectContent>
                {availableIds.length === 0 ? (
                  <SelectItem value="none" disabled>No IDs available</SelectItem>
                ) : (
                  availableIds.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.student_id}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button 
              type="button" 
              onClick={handleClaimStudentId} 
              disabled={!selectedId || loading}
              className="w-full md:w-auto mt-2"
            >
              {loading ? 'Claiming...' : 'Claim This ID'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            You must claim a student ID to complete your profile. Once claimed, it cannot be changed.
          </p>
        </div>
      </div>
    );
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
              {renderStudentIdSection()}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || (role === 'student' && !formData.id)}>
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
