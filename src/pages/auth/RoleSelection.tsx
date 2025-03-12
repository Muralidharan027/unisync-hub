
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, UserCog, Users } from "lucide-react";

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Access announcements and manage leave requests',
    icon: GraduationCap,
    path: '/auth/student/login'
  },
  {
    id: 'staff',
    title: 'Staff',
    description: 'Manage student requests and create announcements',
    icon: Users,
    path: '/auth/staff/login'
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Full system control and management',
    icon: UserCog,
    path: '/auth/admin/login'
  }
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to UniSync</CardTitle>
          <CardDescription>Please select your role to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Button
                key={role.id}
                variant="outline"
                className={`h-auto p-6 flex flex-col items-center gap-4 hover:bg-primary/5 ${
                  selectedRole === role.id ? 'border-primary' : ''
                }`}
                onClick={() => handleRoleSelect(role.path)}
              >
                <role.icon className="h-12 w-12" />
                <div className="text-center">
                  <h3 className="font-semibold">{role.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {role.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
