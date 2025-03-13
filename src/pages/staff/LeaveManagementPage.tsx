
import { useState, useEffect } from "react";
import { FileCheck, FileClock } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";
import { useToast } from "@/hooks/use-toast";

export default function StaffLeaveManagementPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [processedRequests, setProcessedRequests] = useState<LeaveRequest[]>([]);
  const { toast } = useToast();
  
  const tabs = [
    { id: "pending", label: "Pending Requests", icon: <FileClock /> },
    { id: "processed", label: "Processed Requests", icon: <FileCheck /> },
  ];
  
  // Load requests for staff from global store
  useEffect(() => {
    const loadRequests = () => {
      if (window.globalLeaveRequests) {
        const pending = window.globalLeaveRequests.filter(
          r => r.status === "pending"
        );
        
        const processed = window.globalLeaveRequests.filter(
          r => r.status !== "pending"
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
        status: window.globalLeaveRequests[requestIndex].type === "leave" ? "approved" : "acknowledged"
      };
      
      // Update local state
      const updatedPending = window.globalLeaveRequests.filter(
        r => r.status === "pending"
      );
      
      const updatedProcessed = window.globalLeaveRequests.filter(
        r => r.status !== "pending"
      );
      
      setPendingRequests(updatedPending);
      setProcessedRequests(updatedProcessed);
    }
    
    toast({
      title: "Request Approved",
      description: "The leave request has been approved successfully.",
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
        r => r.status === "pending"
      );
      
      const updatedProcessed = window.globalLeaveRequests.filter(
        r => r.status !== "pending"
      );
      
      setPendingRequests(updatedPending);
      setProcessedRequests(updatedProcessed);
    }
    
    toast({
      title: "Request Rejected",
      description: "The leave request has been rejected.",
    });
  };
  
  const handleAcknowledge = (id: string) => {
    // Find the request
    const requestIndex = window.globalLeaveRequests.findIndex(r => r.id === id);
    
    if (requestIndex !== -1) {
      // Update the request status
      window.globalLeaveRequests[requestIndex] = {
        ...window.globalLeaveRequests[requestIndex],
        status: "acknowledged"
      };
      
      // Update local state
      const updatedPending = window.globalLeaveRequests.filter(
        r => r.status === "pending"
      );
      
      const updatedProcessed = window.globalLeaveRequests.filter(
        r => r.status !== "pending"
      );
      
      setPendingRequests(updatedPending);
      setProcessedRequests(updatedProcessed);
    }
    
    toast({
      title: "Request Acknowledged",
      description: "The OD request has been acknowledged and sent to admin for approval.",
    });
  };
  
  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave & OD Management</h1>
          <p className="text-muted-foreground">
            Process and manage student leave and on-duty requests.
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
            role="staff"
            onApprove={handleApprove}
            onReject={handleReject}
            onAcknowledge={handleAcknowledge}
          />
        ) : (
          <LeaveRequestsList 
            requests={processedRequests} 
            role="staff"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
