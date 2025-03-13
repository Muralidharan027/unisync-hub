
import { useState, useEffect } from "react";
import { FileClock, FileText, PlusCircle } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestForm, { LeaveRequestData } from "@/components/leave/LeaveRequestForm";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Shared global store for real-time leave requests (simulating backend)
if (!window.globalLeaveRequests) {
  window.globalLeaveRequests = [
    {
      id: "1",
      type: "leave",
      reason: "Family function",
      details: "Need to attend a family wedding in my hometown.",
      startDate: new Date("2023-11-20"),
      endDate: new Date("2023-11-22"),
      status: "approved",
      studentName: "Student User",
      studentId: "STU001",
      submittedAt: new Date("2023-11-10"),
    },
    {
      id: "2",
      type: "od",
      reason: "Hackathon participation",
      details: "Selected to represent the college in the national level hackathon at IIT Madras.",
      startDate: new Date("2023-12-01"),
      endDate: new Date("2023-12-03"),
      status: "pending",
      studentName: "Student User",
      studentId: "STU001",
      submittedAt: new Date("2023-11-15"),
    }
  ];
}

export default function StudentLeaveManagementPage() {
  const [activeTab, setActiveTab] = useState("history");
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const tabs = [
    { id: "history", label: "Request History", icon: <FileClock /> },
    { id: "new", label: "New Request", icon: <PlusCircle /> },
    { id: "drafts", label: "Drafts", icon: <FileText /> },
  ];
  
  // Load leave requests that belong to the current student
  useEffect(() => {
    if (profile) {
      const studentRequests = window.globalLeaveRequests.filter(
        req => req.studentId === profile.student_id
      );
      setRequests(studentRequests);
    }
  }, [profile]);
  
  // Subscribe to changes in the global leave requests
  useEffect(() => {
    const checkForUpdates = () => {
      if (profile) {
        const studentRequests = window.globalLeaveRequests.filter(
          req => req.studentId === profile.student_id
        );
        setRequests(studentRequests);
      }
    };
    
    // Check for updates every 2 seconds
    const interval = setInterval(checkForUpdates, 2000);
    
    return () => clearInterval(interval);
  }, [profile]);
  
  const handleSubmitLeaveRequest = (data: LeaveRequestData) => {
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newRequest: LeaveRequest = {
        id: `request-${Date.now()}`,
        type: data.type,
        reason: data.reason,
        details: data.details,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "pending",
        studentName: profile?.full_name || "Unknown Student",
        studentId: profile?.student_id || "Unknown ID",
        submittedAt: new Date(),
      };
      
      // Add to global store
      window.globalLeaveRequests.push(newRequest);
      
      // Update local state
      setRequests(prev => [...prev, newRequest]);
      
      setSubmitting(false);
      toast({
        title: "Request Submitted",
        description: `Your ${data.type === 'leave' ? 'leave' : 'OD'} request has been submitted successfully.`,
      });
      
      // Switch to history tab after successful submission
      setActiveTab("history");
    }, 1500);
  };
  
  const handleSaveDraft = (data: LeaveRequestData) => {
    toast({
      title: "Draft Saved",
      description: "Your request has been saved as a draft.",
    });
  };
  
  const handleDownload = (id: string) => {
    toast({
      title: "Download Started",
      description: "Your approval letter is being downloaded",
    });
  };
  
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave & OD Management</h1>
          <p className="text-muted-foreground">
            Submit and track your leave and on-duty requests.
          </p>
        </div>
        
        <ModuleTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === "new" ? (
          <LeaveRequestForm 
            onSubmit={handleSubmitLeaveRequest}
            onSaveDraft={handleSaveDraft}
            isSubmitting={submitting}
          />
        ) : activeTab === "history" ? (
          <LeaveRequestsList 
            requests={requests} 
            role="student"
            onDownload={handleDownload}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            You have no saved drafts.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Add global type for TypeScript
declare global {
  interface Window {
    globalLeaveRequests: LeaveRequest[];
  }
}
