
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, Check, X } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Define proper types for our user data
type BaseUser = {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  status: 'active' | 'inactive';
}

type StudentUser = BaseUser & {
  role: 'student';
  studentId: string;
  staffId?: undefined;
  adminId?: undefined;
}

type StaffUser = BaseUser & {
  role: 'staff';
  staffId: string;
  studentId?: undefined;
  adminId?: undefined;
}

type AdminUser = BaseUser & {
  role: 'admin';
  adminId: string;
  studentId?: undefined;
  staffId?: undefined;
}

type User = StudentUser | StaffUser | AdminUser;

export default function UserManagementSettings() {
  // Mock users data with proper typing
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john.doe@unisync.edu', role: 'student', status: 'active', studentId: 'STU12345' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@unisync.edu', role: 'staff', status: 'active', staffId: 'FAC54321' },
    { id: 3, name: 'Robert Johnson', email: 'robert.johnson@unisync.edu', role: 'admin', status: 'active', adminId: 'ADM98765' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@unisync.edu', role: 'student', status: 'inactive', studentId: 'STU67890' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as const,
    id: '',
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilter = (value: string) => {
    setFilterRole(value);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    // In a real app, you would call an API to create the user
    console.log('Adding new user:', newUser);
    
    // Create a proper user object based on the role
    const newId = Math.max(...users.map(u => u.id)) + 1;
    let userToAdd: User;
    
    if (newUser.role === 'student') {
      userToAdd = {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: 'student',
        status: 'active',
        studentId: newUser.id
      };
    } else if (newUser.role === 'staff') {
      userToAdd = {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: 'staff',
        status: 'active',
        staffId: newUser.id
      };
    } else {
      userToAdd = {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: 'admin',
        status: 'active',
        adminId: newUser.id
      };
    }
    
    setUsers([...users, userToAdd]);
    
    // Reset form
    setNewUser({
      name: '',
      email: '',
      role: 'student',
      id: '',
    });
    setIsAddUserOpen(false);
  };

  const handleDeleteUser = (userId: number) => {
    // In a real app, you would call an API to delete the user
    console.log('Deleting user:', userId);
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleToggleStatus = (userId: number) => {
    // In a real app, you would call an API to update the user status
    console.log('Toggling status for user:', userId);
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } 
        : user
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">User Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage users and their permissions within the system.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              View and manage all users in the system.
            </CardDescription>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with the required details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={newUser.name} 
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newUser.email} 
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value: 'student' | 'staff' | 'admin') => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id">
                    {newUser.role === 'student' ? 'Student ID' : 
                     newUser.role === 'staff' ? 'Staff ID' : 'Admin ID'}
                  </Label>
                  <Input 
                    id="id" 
                    value={newUser.id} 
                    onChange={(e) => setNewUser({...newUser, id: e.target.value})} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Select value={filterRole} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b px-4 py-2 font-medium text-xs">
              <div className="col-span-2">User</div>
              <div>Role</div>
              <div>ID</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            {filteredUsers.length > 0 ? (
              <div className="divide-y">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-6 items-center px-4 py-3">
                    <div className="col-span-2">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <div>
                      <Badge variant="outline" className={
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800 hover:bg-red-100' 
                          : user.role === 'staff'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            : 'bg-green-100 text-green-800 hover:bg-green-100'
                      }>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-xs">
                      {user.studentId || user.staffId || user.adminId || '-'}
                    </div>
                    <div>
                      <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                            {user.status === 'active' ? (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <Button variant="outline" size="sm" disabled>Load More</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
