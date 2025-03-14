import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export default function SecuritySettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeSessions, setActiveSessions] = useState<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: Date;
    current: boolean;
  }>>([]);
  const [loginHistory, setLoginHistory] = useState<Array<{
    id: string;
    date: Date;
    device: string;
    location: string;
    status: "success" | "failed";
  }>>([]);

  useEffect(() => {
    const loadSecuritySettings = () => {
      const savedTwoFactor = localStorage.getItem(`twoFactorEnabled_${user?.email}`);
      setTwoFactorEnabled(savedTwoFactor === "true");

      const savedSessions = localStorage.getItem(`activeSessions_${user?.email}`);
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setActiveSessions(parsedSessions.map((session: any) => ({
          ...session,
          lastActive: new Date(session.lastActive)
        })));
      } else {
        const currentSession = {
          id: Math.random().toString(36).substring(2),
          device: getDeviceInfo(),
          location: "Current location",
          lastActive: new Date(),
          current: true
        };
        setActiveSessions([currentSession]);
        localStorage.setItem(`activeSessions_${user?.email}`, JSON.stringify([currentSession]));
      }

      const savedHistory = localStorage.getItem(`loginHistory_${user?.email}`);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setLoginHistory(parsedHistory.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        })));
      } else {
        const initialLogin = {
          id: Math.random().toString(36).substring(2),
          date: new Date(),
          device: getDeviceInfo(),
          location: "Current location",
          status: "success" as const
        };
        setLoginHistory([initialLogin]);
        localStorage.setItem(`loginHistory_${user?.email}`, JSON.stringify([initialLogin]));
      }
    };

    if (user) {
      loadSecuritySettings();
    }
  }, [user]);

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let device = "Unknown device";
    
    if (/Windows/.test(userAgent)) {
      device = "Windows";
    } else if (/Macintosh|Mac OS X/.test(userAgent)) {
      device = "Mac";
    } else if (/iPhone/.test(userAgent)) {
      device = "iPhone";
    } else if (/iPad/.test(userAgent)) {
      device = "iPad";
    } else if (/Android/.test(userAgent)) {
      device = "Android";
    } else if (/Linux/.test(userAgent)) {
      device = "Linux";
    }
    
    const browser = 
      userAgent.indexOf("Chrome") > -1 ? "Chrome" :
      userAgent.indexOf("Safari") > -1 ? "Safari" :
      userAgent.indexOf("Firefox") > -1 ? "Firefox" :
      userAgent.indexOf("Edge") > -1 ? "Edge" :
      userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1 ? "Internet Explorer" :
      "Unknown browser";
      
    return `${device} - ${browser}`;
  };

  const handleTwoFactorChange = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    localStorage.setItem(`twoFactorEnabled_${user?.email}`, checked.toString());
    
    toast({
      title: checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
      description: checked 
        ? "Your account is now more secure" 
        : "Two-factor authentication has been turned off"
    });
  };

  const terminateSession = (sessionId: string) => {
    const updatedSessions = activeSessions.filter(session => session.id !== sessionId);
    setActiveSessions(updatedSessions);
    localStorage.setItem(`activeSessions_${user?.email}`, JSON.stringify(updatedSessions));
    
    toast({
      title: "Session terminated",
      description: "The selected session has been terminated successfully."
    });
  };

  const terminateAllSessions = () => {
    const currentSession = activeSessions.find(session => session.current);
    const updatedSessions = currentSession ? [currentSession] : [];
    setActiveSessions(updatedSessions);
    localStorage.setItem(`activeSessions_${user?.email}`, JSON.stringify(updatedSessions));
    
    toast({
      title: "All sessions terminated",
      description: "All other sessions have been terminated successfully."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-medium">Authenticator app</h3>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app to get two-factor authentication codes
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices where you're currently logged in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            onClick={terminateAllSessions}
            disabled={activeSessions.length <= 1}
          >
            Sign out from all other devices
          </Button>
          
          <ScrollArea className="h-72 rounded-md border">
            <div className="p-4 space-y-4">
              {activeSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium">{session.device}</h4>
                      {session.current && <Badge variant="outline">Current</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{session.location}</p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {format(session.lastActive, "PPP 'at' p")}
                    </p>
                  </div>
                  {!session.current && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => terminateSession(session.id)}
                    >
                      Sign out
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent account access events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72 rounded-md border">
            <div className="p-4 space-y-4">
              {loginHistory.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium">{entry.device}</h4>
                      <Badge variant={entry.status === "success" ? "default" : "destructive"}>
                        {entry.status === "success" ? "Successful" : "Failed"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(entry.date, "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
