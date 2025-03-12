
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Download, ThumbsDown, ThumbsUp } from "lucide-react";
import { LeaveType } from "./LeaveRequestForm";

export type LeaveStatus = 'pending' | 'acknowledged' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  type: LeaveType;
  reason: string;
  details: string;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  studentName: string;
  studentId: string;
  submittedAt: Date;
}

interface LeaveRequestCardProps {
  request: LeaveRequest;
  role: 'student' | 'staff' | 'admin';
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const LeaveRequestCard = ({ 
  request, 
  role, 
  onApprove, 
  onReject, 
  onAcknowledge,
  onDownload
}: LeaveRequestCardProps) => {
  
  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'acknowledged':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Acknowledged</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderActions = () => {
    if (role === 'student') {
      if (request.status === 'approved' && onDownload) {
        return (
          <Button size="sm" variant="outline" onClick={() => onDownload(request.id)} className="gap-1">
            <Download className="h-4 w-4" />
            Download Letter
          </Button>
        );
      }
      return null;
    }
    
    if (role === 'staff') {
      if (request.type === 'leave' && request.status === 'pending') {
        return (
          <div className="flex gap-2">
            {onApprove && (
              <Button size="sm" variant="outline" className="gap-1 border-green-500 text-green-600 hover:bg-green-50" onClick={() => onApprove(request.id)}>
                <ThumbsUp className="h-4 w-4" />
                Approve
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="outline" className="gap-1 border-red-500 text-red-600 hover:bg-red-50" onClick={() => onReject(request.id)}>
                <ThumbsDown className="h-4 w-4" />
                Reject
              </Button>
            )}
          </div>
        );
      }
      
      if (request.type === 'od' && request.status === 'pending' && onAcknowledge) {
        return (
          <Button size="sm" variant="outline" onClick={() => onAcknowledge(request.id)}>
            Acknowledge
          </Button>
        );
      }
    }
    
    if (role === 'admin') {
      if ((request.type === 'od' && request.status === 'acknowledged') || 
          (request.type === 'leave' && request.status === 'pending')) {
        return (
          <div className="flex gap-2">
            {onApprove && (
              <Button size="sm" variant="outline" className="gap-1 border-green-500 text-green-600 hover:bg-green-50" onClick={() => onApprove(request.id)}>
                <ThumbsUp className="h-4 w-4" />
                Approve
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="outline" className="gap-1 border-red-500 text-red-600 hover:bg-red-50" onClick={() => onReject(request.id)}>
                <ThumbsDown className="h-4 w-4" />
                Reject
              </Button>
            )}
          </div>
        );
      }
    }
    
    return null;
  };
  
  return (
    <Card className="w-full mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge variant={request.type === 'leave' ? 'default' : 'secondary'}>
              {request.type === 'leave' ? 'Leave' : 'OD'}
            </Badge>
            {getStatusBadge(request.status)}
          </div>
          <span className="text-sm text-muted-foreground">
            Submitted: {format(request.submittedAt, 'MMM dd, yyyy')}
          </span>
        </div>
        
        <CardTitle className="mt-2 text-lg">
          {request.reason}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <span className="text-muted-foreground">From:</span>{' '}
            {format(request.startDate, 'MMM dd, yyyy')}
          </div>
          <div>
            <span className="text-muted-foreground">To:</span>{' '}
            {format(request.endDate, 'MMM dd, yyyy')}
          </div>
        </div>

        <p className="text-sm">{request.details}</p>
        
        {(role === 'staff' || role === 'admin') && (
          <div className="mt-3 text-sm">
            <span className="text-muted-foreground">Student:</span>{' '}
            {request.studentName} ({request.studentId})
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        {renderActions()}
      </CardFooter>
    </Card>
  );
};

export default LeaveRequestCard;
