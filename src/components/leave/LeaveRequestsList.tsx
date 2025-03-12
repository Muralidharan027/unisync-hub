
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, Calendar } from "lucide-react";
import LeaveRequestCard, { LeaveRequest, LeaveStatus } from "./LeaveRequestCard";
import { LeaveType } from "./LeaveRequestForm";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LeaveRequestsListProps {
  requests: LeaveRequest[];
  role: 'student' | 'staff' | 'admin';
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const LeaveRequestsList = ({ 
  requests, 
  role,
  onApprove,
  onReject,
  onAcknowledge,
  onDownload
}: LeaveRequestsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<LeaveType | ''>('');
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | ''>('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const handleDownload = (id: string) => {
    if (onDownload) {
      onDownload(id);
    } else {
      toast({
        title: "Download Started",
        description: "Your approval letter is being downloaded",
      });
    }
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setFilterDate(undefined);
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType ? request.type === filterType : true;
    const matchesStatus = filterStatus ? request.status === filterStatus : true;
    
    let matchesDate = true;
    if (filterDate) {
      const filterDateStr = format(filterDate, 'yyyy-MM-dd');
      const startDateStr = format(request.startDate, 'yyyy-MM-dd');
      const endDateStr = format(request.endDate, 'yyyy-MM-dd');
      
      matchesDate = filterDateStr >= startDateStr && filterDateStr <= endDateStr;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const types: LeaveType[] = ['leave', 'od'];
  const statuses: LeaveStatus[] = ['pending', 'acknowledged', 'approved', 'rejected'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-1"
            aria-label="Filter requests"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          
          <div className="flex gap-1 flex-wrap">
            {types.map((type) => (
              <Badge
                key={type}
                className={`cursor-pointer ${filterType === type ? 'bg-primary' : 'bg-secondary'}`}
                onClick={() => setFilterType(type === filterType ? '' : type)}
              >
                {type === 'leave' ? 'Leave' : 'OD'}
              </Badge>
            ))}
            
            {statuses.map((status) => (
              <Badge
                key={status}
                variant="outline"
                className={`cursor-pointer ${filterStatus === status ? 'border-primary text-primary' : ''}`}
                onClick={() => setFilterStatus(status === filterStatus ? '' : status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            ))}
            
            <Popover>
              <PopoverTrigger asChild>
                <Badge
                  variant="outline"
                  className={`cursor-pointer flex items-center gap-1 ${filterDate ? 'border-primary text-primary' : ''}`}
                >
                  <Calendar className="h-3 w-3" />
                  {filterDate ? format(filterDate, 'MMM dd') : 'Date'}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={filterDate}
                  onSelect={setFilterDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {(filterType || filterStatus || filterDate) && (
              <Badge
                variant="outline"
                className="cursor-pointer flex items-center gap-1"
                onClick={clearFilters}
              >
                Clear <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No requests found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <LeaveRequestCard
              key={request.id}
              request={request}
              role={role}
              onApprove={onApprove}
              onReject={onReject}
              onAcknowledge={onAcknowledge}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveRequestsList;
