
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { Check, Download, X } from "lucide-react";

export interface LeaveRequest {
  id: string;
  type: 'leave' | 'od';
  reason: string;
  details: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'acknowledged';
  studentName: string;
  studentId: string;
  submittedAt: Date;
  periods?: number; // Added periods for OD requests
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
  const {
    id,
    type,
    reason,
    details,
    startDate,
    endDate,
    status,
    studentName,
    submittedAt,
    periods
  } = request;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    acknowledged: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  };

  const isOD = type === 'od';
  
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <h3 className="font-semibold">
            {isOD ? 'On Duty Request' : 'Leave Request'}
            <Badge
              variant="outline"
              className={`ml-2 ${statusColors[status]}`}
            >
              {status}
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Submitted on {format(new Date(submittedAt), "MMM dd, yyyy")}
          </p>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="mb-2">
          <span className="font-medium">Student:</span> {studentName}
        </div>
        
        <div className="mb-2">
          <span className="font-medium">Period:</span>{" "}
          {format(new Date(startDate), "MMM dd, yyyy")}
          {" to "}
          {format(new Date(endDate), "MMM dd, yyyy")}
          {isOD && periods && (
            <span className="ml-2">
              ({periods} {periods === 1 ? 'period' : 'periods'})
            </span>
          )}
        </div>
        
        <div className="mb-2">
          <span className="font-medium">Reason:</span> {reason}
        </div>
        
        <div className="mb-2">
          <span className="font-medium">Details:</span> {details}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        {status === 'approved' && onDownload && (
          <Button
            onClick={() => onDownload(id)}
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
        
        {status === 'pending' && role === 'staff' && (
          <>
            {isOD && onAcknowledge && (
              <Button
                onClick={() => onAcknowledge(id)}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Acknowledge
              </Button>
            )}
            
            {!isOD && onApprove && (
              <Button
                onClick={() => onApprove(id)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
            )}
            
            {onReject && (
              <Button
                onClick={() => onReject(id)}
                size="sm"
                variant="destructive"
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            )}
          </>
        )}
        
        {(status === 'pending' || status === 'acknowledged') && role === 'admin' && onApprove && (
          <>
            <Button
              onClick={() => onApprove(id)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
            
            {onReject && (
              <Button
                onClick={() => onReject(id)}
                size="sm"
                variant="destructive"
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default LeaveRequestCard;
