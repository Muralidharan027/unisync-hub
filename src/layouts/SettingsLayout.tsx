
import React, { ReactNode } from 'react';
import { Bell, Moon, Shield, User, History, Key, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

type SettingsLayoutProps = {
  children: ReactNode;
  role: 'student' | 'staff' | 'admin';
};

export default function SettingsLayout({ children, role }: SettingsLayoutProps) {
  const location = useLocation();
  
  const baseUrl = `/${role}/settings`;
  
  const navItems: NavItem[] = [
    {
      title: "Profile",
      href: `${baseUrl}/profile`,
      icon: <User className="h-4 w-4" />,
    },
    {
      title: "Notifications",
      href: `${baseUrl}/notifications`,
      icon: <Bell className="h-4 w-4" />,
    },
    {
      title: "Appearance",
      href: `${baseUrl}/appearance`,
      icon: <Moon className="h-4 w-4" />,
    },
    {
      title: "Security",
      href: `${baseUrl}/security`,
      icon: <Shield className="h-4 w-4" />,
    },
    {
      title: "Activity",
      href: `${baseUrl}/activity`,
      icon: <History className="h-4 w-4" />,
    },
  ];

  // Add admin-specific navigation items
  if (role === 'admin') {
    navItems.push({
      title: "User Management",
      href: `${baseUrl}/user-management`,
      icon: <Key className="h-4 w-4" />,
    });
  }

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        </div>
        
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    location.pathname === item.href
                      ? "bg-accent text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="flex-1 lg:max-w-4xl">
            {children}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
