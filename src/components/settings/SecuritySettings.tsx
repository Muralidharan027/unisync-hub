
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Laptop, Smartphone, LogOut } from 'lucide-react';

export default function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Mock active sessions data
  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Chennai, India',
      lastActive: 'Active now',
      icon: <Laptop className="h-4 w-4" />,
      isCurrent: true,
    },
    {
      id: 2,
      device: 'Mobile App on Android',
      location: 'Chennai, India',
      lastActive: '3 hours ago',
      icon: <Smartphone className="h-4 w-4" />,
      isCurrent: false,
    },
  ];

  const handleLogout = (sessionId: number) => {
    // In a real app, you would call an API to log out the session
    console.log(`Logging out session ${sessionId}`);
  };

  const handleToggleTwoFactor = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    // In a real app, you would initialize the 2FA setup flow
    if (checked) {
      console.log('Initializing 2FA setup');
    } else {
      console.log('Disabling 2FA');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security settings and active sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="two-factor" className="flex-1">
              Enable Two-Factor Authentication
              <span className="block text-xs text-muted-foreground">
                Receive verification codes via your mobile authenticator app.
              </span>
            </Label>
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={handleToggleTwoFactor}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your currently active sessions across devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between space-x-4 rounded-md border p-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-secondary p-2">
                  {session.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {session.device}
                    {session.isCurrent && (
                      <span className="ml-2 text-xs text-green-500 font-medium">
                        (Current)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLogout(session.id)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login activity on your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: 'Today, 10:30 AM', device: 'Chrome on Windows', location: 'Chennai, India', status: 'Success' },
              { date: 'Yesterday, 8:15 PM', device: 'Mobile App on Android', location: 'Chennai, India', status: 'Success' },
              { date: '2 days ago, 3:45 PM', device: 'Firefox on Windows', location: 'Coimbatore, India', status: 'Success' },
            ].map((log, index) => (
              <div key={index} className="flex justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{log.date}</p>
                  <p className="text-xs text-muted-foreground">{log.device} • {log.location}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-green-500">{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">View Full History</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
