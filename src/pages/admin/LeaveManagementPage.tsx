
import { useState, useEffect } from "react";
import { FileCheck, FileClock } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLeaveManagementPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [processedRequests, setProcessedRequests] = useState<LeaveRequest[]>([]);
  const { toast } = useToast();
  
  const tabs = [
    { id: "pending", label: "Pending Requests", icon: <FileClock /> },
    { id: "processed", label: "Processed Requests", icon: <FileCheck /> },
  ];
  
  // Load requests from Supabase
  useEffect(() => {
    const loadRequests = async () => {
      try {
        // Try to load from Supabase
        const { data: allRequests, error } = await supabase
          .from('leave_requests')
          .select('*');
        
        if (error) {
          console.error("Error loading requests from Supabase:", error);
          
          // Fallback to window.globalLeaveRequests if Supabase query fails
          if (window.globalLeaveRequests) {
            const pending = window.globalLeaveRequests.filter(
              r => r.status === "pending" || r.status === "acknowledged"
            );
            
            const processed = window.globalLeaveRequests.filter(
              r => r.status === "approved" || r.status === "rejected"
            );
            
            setPendingRequests(pending);
            setProcessedRequests(processed);
          }
          return;
        }
        
        if (allRequests) {
          // Convert Supabase data format to LeaveRequest format
          const formattedRequests = allRequests.map(req => ({
            id: req.id,
            type: req.type as 'leave' | 'od',
            reason: req.reason,
            details: req.details || '',
            startDate: new Date(req.start_date),
            endDate: new Date(req.end_date),
            status: req.status,
            studentName: req.sender_name || "Unknown Student",
            studentId: req.register_number || "Unknown ID",
            submittedAt: new Date(req.created_at),
            // Additional fields
            senderName: req.sender_name || "",
            registerNumber: req.register_number || "",
            classYear: req.class_year || "",
            section: req.section || "",
            rollNumber: req.roll_number || "",
            staffEmail: req.staff_email || "",
            adminEmail: req.admin_email || "",
            periods: req.periods
          }));
          
          const pending = formattedRequests.filter(
            r => r.status === "pending" || r.status === "acknowledged"
          );
          
          const processed = formattedRequests.filter(
            r => r.status === "approved" || r.status === "rejected"
          );
          
          setPendingRequests(pending);
          setProcessedRequests(processed);
        } else {
          // Fallback to window.globalLeaveRequests if no Supabase data
          if (window.globalLeaveRequests) {
            const pending = window.globalLeaveRequests.filter(
              r => r.status === "pending" || r.status === "acknowledged"
            );
            
            const processed = window.globalLeaveRequests.filter(
              r => r.status === "approved" || r.status === "rejected"
            );
            
            setPendingRequests(pending);
            setProcessedRequests(processed);
          }
        }
      } catch (err) {
        console.error("Error in useEffect:", err);
        // Fallback to window.globalLeaveRequests on any error
        if (window.globalLeaveRequests) {
          const pending = window.globalLeaveRequests.filter(
            r => r.status === "pending" || r.status === "acknowledged"
          );
          
          const processed = window.globalLeaveRequests.filter(
            r => r.status === "approved" || r.status === "rejected"
          );
          
          setPendingRequests(pending);
          setProcessedRequests(processed);
        }
      }
    };
    
    loadRequests();
    
    // Real-time updates
    const interval = setInterval(loadRequests, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleApprove = async (id: string) => {
    try {
      // Try to update in Supabase first
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) {
        console.error("Error updating in Supabase:", error);
        
        // Fallback to window.globalLeaveRequests
        const requestIndex = window.globalLeaveRequests.findIndex(r => r.id === id);
        
        if (requestIndex !== -1) {
          // Update the request status
          window.globalLeaveRequests[requestIndex] = {
            ...window.globalLeaveRequests[requestIndex],
            status: "approved"
          };
          
          // Update local state
          setPendingRequests(prev => prev.filter(r => r.id !== id));
          setProcessedRequests(prev => [
            ...prev, 
            { ...window.globalLeaveRequests[requestIndex], status: "approved" }
          ]);
        }
      } else {
        // Update local state for UI
        const approvedRequest = pendingRequests.find(r => r.id === id);
        if (approvedRequest) {
          const updatedRequest = { ...approvedRequest, status: 'approved' };
          setPendingRequests(prev => prev.filter(r => r.id !== id));
          setProcessedRequests(prev => [...prev, updatedRequest]);
        }
      }
      
      toast({
        title: "Request Approved",
        description: "The request has been approved successfully.",
      });
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Approval Failed",
        description: "There was an error approving the request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      // Try to update in Supabase first
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (error) {
        console.error("Error updating in Supabase:", error);
        
        // Fallback to window.globalLeaveRequests
        const requestIndex = window.globalLeaveRequests.findIndex(r => r.id === id);
        
        if (requestIndex !== -1) {
          // Update the request status
          window.globalLeaveRequests[requestIndex] = {
            ...window.globalLeaveRequests[requestIndex],
            status: "rejected"
          };
          
          // Update local state
          setPendingRequests(prev => prev.filter(r => r.id !== id));
          setProcessedRequests(prev => [
            ...prev, 
            { ...window.globalLeaveRequests[requestIndex], status: "rejected" }
          ]);
        }
      } else {
        // Update local state for UI
        const rejectedRequest = pendingRequests.find(r => r.id === id);
        if (rejectedRequest) {
          const updatedRequest = { ...rejectedRequest, status: 'rejected' };
          setPendingRequests(prev => prev.filter(r => r.id !== id));
          setProcessedRequests(prev => [...prev, updatedRequest]);
        }
      }
      
      toast({
        title: "Request Rejected",
        description: "The request has been rejected.",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Rejection Failed",
        description: "There was an error rejecting the request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDownload = async (id: string) => {
    toast({
      title: "Download Started",
      description: "The approval letter is being downloaded",
    });
    
    try {
      // Find the request data
      const requestData = [...pendingRequests, ...processedRequests].find(req => req.id === id);
      
      if (!requestData) {
        throw new Error("Request not found");
      }
      
      // Call the serverless function to generate PDF
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
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a download link
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
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave & OD Management</h1>
          <p className="text-muted-foreground">
            Process and manage all student leave and on-duty requests.
          </p>
        </div>
        
        <ModuleTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === "pending" ? (
          <LeaveRequestsList 
            requests={pendingRequests} 
            role="admin"
            onApprove={handleApprove}
            onReject={handleReject}
            onDownload={handleDownload}
          />
        ) : (
          <LeaveRequestsList 
            requests={processedRequests} 
            role="admin"
            onDownload={handleDownload}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
