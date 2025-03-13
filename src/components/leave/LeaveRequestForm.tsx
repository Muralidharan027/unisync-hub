
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type LeaveType = 'leave' | 'od';

interface LeaveRequestFormProps {
  onSubmit: (data: LeaveRequestData) => void;
  onSaveDraft?: (data: LeaveRequestData) => void;
  isSubmitting?: boolean;
}

export interface LeaveRequestData {
  type: LeaveType;
  reason: string;
  details: string;
  startDate: Date;
  endDate: Date;
  periods?: number; // Added periods field for OD requests
}

const LeaveRequestForm = ({ 
  onSubmit, 
  onSaveDraft, 
  isSubmitting = false 
}: LeaveRequestFormProps) => {
  const [type, setType] = useState<LeaveType>('leave');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [periods, setPeriods] = useState<number>(1);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast({
        title: "Missing reason",
        description: "Please provide a reason for your request",
        variant: "destructive",
      });
      return;
    }

    if (!details.trim()) {
      toast({
        title: "Missing details",
        description: "Please provide more details for your request",
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Invalid dates",
        description: "End date cannot be before start date",
        variant: "destructive",
      });
      return;
    }

    if (type === 'od' && (periods < 1 || periods > 5)) {
      toast({
        title: "Invalid periods",
        description: "Number of periods must be between 1 and 5",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      type,
      reason,
      details,
      startDate,
      endDate,
      ...(type === 'od' && { periods })
    });
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft({
        type,
        reason,
        details,
        startDate,
        endDate,
        ...(type === 'od' && { periods })
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Submit {type === 'leave' ? 'Leave' : 'OD'} Request</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Request Type</Label>
            <Select 
              value={type} 
              onValueChange={(value) => setType(value as LeaveType)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="od">On Duty (OD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {type === 'od' && (
            <div className="space-y-2">
              <Label htmlFor="periods">Number of Periods/Hours (max 5)</Label>
              <Select 
                value={periods.toString()} 
                onValueChange={(value) => setPeriods(parseInt(value))}
              >
                <SelectTrigger id="periods">
                  <SelectValue placeholder="Select number of periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Period</SelectItem>
                  <SelectItem value="2">2 Periods</SelectItem>
                  <SelectItem value="3">3 Periods</SelectItem>
                  <SelectItem value="4">4 Periods</SelectItem>
                  <SelectItem value="5">5 Periods</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder={type === 'leave' ? "Reason for leave" : "Reason for OD request"}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              placeholder="Provide more information..."
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {onSaveDraft && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSaveDraft}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LeaveRequestForm;
