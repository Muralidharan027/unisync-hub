import { useState, useEffect } from "react";
import { FileClock, FileText, PlusCircle } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestForm, { LeaveRequestData } from "@/components/leave/LeaveRequestForm";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addLeaveRequest, getLeaveRequests } from "@/store/leaveRequests";

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
  
  useEffect(() => {
    if (profile) {
      const studentRequests = getLeaveRequests().filter(
        req => req.studentId === profile.student_id
      );
      setRequests(studentRequests);
    }
  }, [profile]);
  
  useEffect(() => {
    const checkForUpdates = () => {
      if (profile) {
        const studentRequests = getLeaveRequests().filter(
          req => req.studentId === profile.student_id
        );
        setRequests(studentRequests);
      }
    };
    
    const interval = setInterval(checkForUpdates, 2000);
    
    return () => clearInterval(interval);
  }, [profile]);
  
  const handleSubmitLeaveRequest = (data: LeaveRequestData) => {
    setSubmitting(true);
    
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
        periods: data.type === 'od' ? data.periods : undefined
      };
      
      addLeaveRequest(newRequest);
      
      setRequests(prev => [...prev, newRequest]);
      
      setSubmitting(false);
      toast({
        title: "Request Submitted",
        description: `Your ${data.type === 'leave' ? 'leave' : 'OD'} request has been submitted successfully.`,
      });
      
      setActiveTab("history");
    }, 1500);
  };
  
  const handleSaveDraft = (data: LeaveRequestData) => {
    toast({
      title: "Draft Saved",
      description: "Your request has been saved as a draft.",
    });
  };
  
  const handleDownload = async (id: string) => {
    toast({
      title: "Download Started",
      description: "Your approval letter is being downloaded",
    });
    
    try {
      const requestData = requests.find(req => req.id === id);
      
      if (!requestData) {
        throw new Error("Request not found");
      }
      
      const response = await fetch('https://fahqlerywybttjinbanp.functions.supabase.co/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaHFsZXJ5d3lidHRqaW5iYW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NTczODEsImV4cCI6MjA1NzQzMzM4MX0.4tkhXB8BYlkAQlmkYYvfuK8gPjoGQztY2xhGbko3fcU'
        },
        body: JSON.stringify({ requestData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${requestData.type}_request_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Your approval letter has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Leave & OD Management</h1>
        <p className="text-muted-foreground">
          Submit and track your leave and on-duty requests.
        </p>
        
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
