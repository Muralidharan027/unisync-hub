
import React, { ReactNode, useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsLayoutProps {
  children?: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Extract role from the URL path
  const role = location.pathname.split('/')[1];
  
  useEffect(() => {
    // If path is just /role/settings, redirect to /role/settings/profile
    if (location.pathname === `/${role}/settings`) {
      navigate(`/${role}/settings/profile`);
    }
  }, [location.pathname, navigate, role]);
  
  const isAdmin = role === 'admin';
  
  const links = [
    {
      href: `/${role}/settings/profile`,
      label: 'Profile',
      id: 'profile',
    },
    {
      href: `/${role}/settings/notifications`,
      label: 'Notifications',
      id: 'notifications',
    },
    {
      href: `/${role}/settings/appearance`,
      label: 'Appearance',
      id: 'appearance',
    },
    {
      href: `/${role}/settings/security`,
      label: 'Security',
      id: 'security',
    },
  ];
  
  // Add User Management link only for admins
  if (isAdmin) {
    links.push({
      href: `/${role}/settings/users`,
      label: 'User Management',
      id: 'users',
    });
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex flex-col space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  location.pathname.includes(link.id)
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "justify-start"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
}
