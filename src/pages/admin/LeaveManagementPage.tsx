
import { useState, useEffect } from "react";
import { FileCheck, FileClock } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";
import { useToast } from "@/hooks/use-toast";

export default function AdminLeaveManagementPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [processedRequests, setProcessedRequests] = useState<LeaveRequest[]>([]);
  const { toast } = useToast();
  
  const tabs = [
    { id: "pending", label: "Pending Requests", icon: <FileClock /> },
    { id: "processed", label: "Processed Requests", icon: <FileCheck /> },
  ];
  
  // Load requests from global store
  useEffect(() => {
    const loadRequests = () => {
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
    };
    
    loadRequests();
    
    // Real-time updates
    const interval = setInterval(loadRequests, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleApprove = (id: string) => {
    // Find the request
    const requestIndex = window.globalLeaveRequests.findIndex(r => r.id === id);
    
    if (requestIndex !== -1) {
      // Update the request status
      window.globalLeaveRequests[requestIndex] = {
        ...window.globalLeaveRequests[requestIndex],
        status: "approved"
      };
      
      // Update local state
      const updatedPending = window.globalLeaveRequests.filter(
        r => r.status === "pending" || r.status === "acknowledged"
      );
      
      const updatedProcessed = window.globalLeaveRequests.filter(
        r => r.status === "approved" || r.status === "rejected"
      );
      
      setPendingRequests(updatedPending);
      setProcessedRequests(updatedProcessed);
    }
    
    toast({
      title: "Request Approved",
      description: "The request has been approved successfully.",
    });
  };
  
  const handleReject = (id: string) => {
    // Find the request
    const requestIndex = window.globalLeaveRequests.findIndex(r => r.id === id);
    
    if (requestIndex !== -1) {
      // Update the request status
      window.globalLeaveRequests[requestIndex] = {
        ...window.globalLeaveRequests[requestIndex],
        status: "rejected"
      };
      
      // Update local state
      const updatedPending = window.globalLeaveRequests.filter(
        r => r.status === "pending" || r.status === "acknowledged"
      );
      
      const updatedProcessed = window.globalLeaveRequests.filter(
        r => r.status === "approved" || r.status === "rejected"
      );
      
      setPendingRequests(updatedPending);
      setProcessedRequests(updatedProcessed);
    }
    
    toast({
      title: "Request Rejected",
      description: "The request has been rejected.",
    });
  };
  
  const handleDownload = (id: string) => {
    toast({
      title: "Download Started",
      description: "The approval letter is being downloaded",
    });
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
