
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import LeaveRequestCard from '@/components/leave/LeaveRequestCard';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import { useLeaveRequests } from '@/store/leaveRequests';

type ViewMode = 'student' | 'staff' | 'admin';

type LeaveRequestsListProps = {
  viewMode: ViewMode;
};

export default function LeaveRequestsList({ viewMode }: LeaveRequestsListProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<'leave' | 'od'>('leave');
  
  const { 
    leaveRequests, 
    loading,
    error,
    fetchLeaveRequests,
    createLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest
  } = useLeaveRequests();

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const handleCreateRequest = (formData: any) => {
    // Add the user ID to the request
    const newRequest = {
      ...formData,
      type: leaveType,
      status: 'pending',
      userId: user?.id,
      // Remove this property as it's causing the TypeScript error
      // creatorId: user?.id,
    };
    
    createLeaveRequest(newRequest);
    setShowForm(false);
    toast({
      title: "Request Submitted",
      description: `Your ${leaveType} request has been submitted successfully.`,
    });
  };

  const handleApproveReject = (id: string, status: 'approved' | 'rejected') => {
    updateLeaveRequest(id, { status });
    toast({
      title: `Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `The request has been ${status}.`,
    });
  };

  const handleDelete = (id: string) => {
    deleteLeaveRequest(id);
    toast({
      title: "Request Deleted",
      description: "The request has been deleted successfully.",
    });
  };

  const filteredRequests = leaveRequests.filter(req => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return req.status === 'pending';
    if (activeTab === 'approved') return req.status === 'approved';
    if (activeTab === 'rejected') return req.status === 'rejected';
    if (activeTab === 'leave') return req.type === 'leave';
    if (activeTab === 'od') return req.type === 'od';
    return true;
  });

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Error loading leave requests: {error}</p>
        <Button onClick={() => fetchLeaveRequests()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {viewMode === 'student' ? 'My Leave Requests' : 'Leave Management'}
        </h2>
        
        {viewMode === 'student' && (
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setLeaveType('leave');
                setShowForm(true);
              }}
            >
              Request Leave
            </Button>
            <Button 
              onClick={() => {
                setLeaveType('od');
                setShowForm(true);
              }}
              variant="outline"
            >
              Request OD
            </Button>
          </div>
        )}
      </div>
      
      <Separator />
      
      {showForm && viewMode === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>New {leaveType === 'leave' ? 'Leave' : 'On Duty'} Request</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveRequestForm 
              type={leaveType}
              onSubmit={handleCreateRequest}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="od">OD</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <p className="text-muted-foreground mb-2">No requests found</p>
                {viewMode === 'student' && !showForm && (
                  <Button onClick={() => setShowForm(true)}>Create Request</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                viewMode={viewMode}
                onApprove={
                  viewMode !== 'student' 
                    ? () => handleApproveReject(request.id, 'approved') 
                    : undefined
                }
                onReject={
                  viewMode !== 'student'
                    ? () => handleApproveReject(request.id, 'rejected')
                    : undefined
                }
                onDelete={
                  (viewMode === 'student' && request.status === 'pending') || viewMode === 'admin'
                    ? () => handleDelete(request.id)
                    : undefined
                }
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
