
import React, { useState, useEffect } from "react";
import { LeaveRequest } from "./LeaveRequestCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LeaveRequestCard from "./LeaveRequestCard";
import { FileText, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LeaveRequestForm from "./LeaveRequestForm";
import { getLeaveRequests, addLeaveRequest, updateLeaveRequest } from "@/store/leaveRequests";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type LeaveRequestsListProps = {
  requests?: LeaveRequest[];
  role?: 'student' | 'staff' | 'admin';
  viewMode?: 'student' | 'staff' | 'admin';
  onDownload?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
};

const LeaveRequestsList = ({ 
  role, 
  viewMode = 'student',
  onDownload,
  onApprove,
  onReject,
  onAcknowledge
}: LeaveRequestsListProps) => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  // Use the viewMode prop if role is not provided
  const effectiveRole = role || viewMode;
  
  useEffect(() => {
    // Load leave requests
    loadLeaveRequests();
  }, [effectiveRole]);
  
  const loadLeaveRequests = () => {
    const allRequests = getLeaveRequests();
    
    // Filter requests based on the role
    let filteredRequests = allRequests;
    
    if (effectiveRole === 'student' && profile) {
      // Students only see their own requests
      filteredRequests = allRequests.filter(
        request => request.studentId === profile.id || request.creatorId === profile.id
      );
    }
    
    // Sort by submission date (newest first)
    filteredRequests.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    
    setRequests(filteredRequests);
  };
  
  const handleCreateRequest = async (requestData: any) => {
    setIsSubmitting(true);
    
    try {
      // Create a new leave request object
      const newRequest: LeaveRequest = {
        id: uuidv4(),
        type: requestData.type,
        reason: requestData.reason,
        details: requestData.details,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        status: 'pending',
        studentName: requestData.senderName,
        studentId: profile?.id || '',
        submittedAt: new Date(),
        creatorId: profile?.id,
        // Add additional fields
        senderName: requestData.senderName,
        registerNumber: requestData.registerNumber,
        classYear: requestData.classYear,
        section: requestData.section,
        rollNumber: requestData.rollNumber,
        staffEmail: requestData.staffEmail,
        adminEmail: requestData.adminEmail,
        department: requestData.department
      };
      
      // If it's an OD request, add the periods
      if (requestData.type === 'od' && requestData.periods) {
        newRequest.periods = requestData.periods;
      }
      
      // Add the request to the store
      addLeaveRequest(newRequest);
      
      // Update the local state
      loadLeaveRequests();
      
      // Close the form
      setIsFormOpen(false);
      
      // Show success toast
      toast({
        title: "Request Submitted",
        description: `Your ${requestData.type === 'leave' ? 'leave' : 'OD'} request has been submitted successfully.`,
      });
    } catch (error) {
      console.error("Error creating leave request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApproveRequest = (id: string) => {
    updateLeaveRequest(id, { status: 'approved' });
    loadLeaveRequests();
    toast({
      title: "Request Approved",
      description: "The request has been approved successfully.",
    });
  };
  
  const handleRejectRequest = (id: string) => {
    updateLeaveRequest(id, { status: 'rejected' });
    loadLeaveRequests();
    toast({
      title: "Request Rejected",
      description: "The request has been rejected.",
    });
  };
  
  const handleAcknowledgeRequest = (id: string) => {
    updateLeaveRequest(id, { status: 'acknowledged' });
    loadLeaveRequests();
    toast({
      title: "Request Acknowledged",
      description: "The request has been acknowledged.",
    });
  };
  
  const handleDownloadRequest = (id: string) => {
    // In a real application, this would generate and download a PDF
    // For now, we'll just show a toast
    toast({
      title: "Download Started",
      description: "Your request document is being downloaded.",
    });
    
    // Call the onDownload prop if provided
    if (onDownload) {
      onDownload(id);
    }
  };
  
  if (requests.length === 0) {
    return (
      <div className="space-y-4">
        {effectiveRole === 'student' && (
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Leave Management</h2>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create New Request</DialogTitle>
                </DialogHeader>
                <LeaveRequestForm 
                  onSubmit={handleCreateRequest}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">No Requests Found</CardTitle>
            <CardDescription>
              You don't have any leave or OD requests yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {effectiveRole === 'student' 
                  ? 'Create a new request to view it here.' 
                  : 'There are no pending requests to review.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {effectiveRole === 'student' && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Leave Management</h2>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Request</DialogTitle>
              </DialogHeader>
              <LeaveRequestForm 
                onSubmit={handleCreateRequest}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {effectiveRole !== 'student' && (
        <h2 className="text-2xl font-bold mb-4">Leave Requests</h2>
      )}
      
      {requests.map((request) => (
        <LeaveRequestCard 
          key={request.id}
          request={request}
          role={effectiveRole}
          onDownload={handleDownloadRequest}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          onAcknowledge={handleAcknowledgeRequest}
        />
      ))}
    </div>
  );
};

export default LeaveRequestsList;
