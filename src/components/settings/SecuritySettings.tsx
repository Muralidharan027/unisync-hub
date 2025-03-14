
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Laptop, Smartphone, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    // Get sessions from localStorage
    const loadSessions = () => {
      if (!user) return;
      
      const savedSessions = localStorage.getItem(`sessions_${user.email}`);
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      } else {
        // Create default current session
        const currentSession = {
          id: 1,
          device: `${getBrowser()} on ${getOS()}`,
          location: 'Current Location',
          lastActive: 'Active now',
          icon: <Laptop className="h-4 w-4" />,
          isCurrent: true,
        };
        
        setSessions([currentSession]);
        localStorage.setItem(`sessions_${user.email}`, JSON.stringify([currentSession]));
      }
      
      // Get login history - create initial history if none exists
      const savedHistory = localStorage.getItem(`loginHistory_${user.email}`);
      if (savedHistory) {
        setLoginHistory(JSON.parse(savedHistory));
      } else {
        const newHistory = [
          { 
            date: new Date().toLocaleString(), 
            device: `${getBrowser()} on ${getOS()}`, 
            location: 'Current Location', 
            status: 'Success' 
          }
        ];
        setLoginHistory(newHistory);
        localStorage.setItem(`loginHistory_${user.email}`, JSON.stringify(newHistory));
      }
    };
    
    loadSessions();
  }, [user]);

  const getBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    return "Unknown Browser";
  };
  
  const getOS = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Windows") > -1) return "Windows";
    if (userAgent.indexOf("Mac") > -1) return "macOS";
    if (userAgent.indexOf("Linux") > -1) return "Linux";
    if (userAgent.indexOf("Android") > -1) return "Android";
    if (userAgent.indexOf("iOS") > -1 || userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) return "iOS";
    return "Unknown OS";
  };

  const handleLogout = (sessionId: number) => {
    if (!user) return;
    
    // Filter out the session
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem(`sessions_${user.email}`, JSON.stringify(updatedSessions));
    
    toast({
      title: "Session logged out",
      description: "The device has been logged out successfully."
    });
  };

  const handleToggleTwoFactor = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    
    toast({
      title: checked ? "Two-Factor Authentication Enabled" : "Two-Factor Authentication Disabled",
      description: checked 
        ? "Your account is now more secure with 2FA." 
        : "Two-factor authentication has been disabled."
    });
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
          {sessions.map((session) => (
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
            {loginHistory.map((log, index) => (
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
