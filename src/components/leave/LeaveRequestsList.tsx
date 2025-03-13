
import React from "react";
import { LeaveRequest } from "./LeaveRequestCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LeaveRequestCard from "./LeaveRequestCard";
import { FileText } from "lucide-react";

type LeaveRequestsListProps = {
  requests: LeaveRequest[];
  role: 'student' | 'staff' | 'admin';
  onDownload?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

const LeaveRequestsList = ({ 
  requests, 
  role, 
  onDownload,
  onApprove,
  onReject 
}: LeaveRequestsListProps) => {
  if (requests.length === 0) {
    return (
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
              {role === 'student' 
                ? 'Create a new request to view it here.' 
                : 'There are no pending requests to review.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <LeaveRequestCard 
          key={request.id}
          request={request}
          role={role}
          onDownload={onDownload}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default LeaveRequestsList;
