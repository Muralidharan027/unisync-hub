
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type LeaveRequestData = {
  type: 'leave' | 'od';
  reason: string;
  details: string;
  startDate: Date;
  endDate: Date;
  periods?: number; // Number of periods for OD (1-5)
};

type LeaveRequestFormProps = {
  onSubmit: (data: LeaveRequestData) => void;
  onSaveDraft?: (data: LeaveRequestData) => void;
  isSubmitting?: boolean;
};

const LeaveRequestForm = ({ onSubmit, onSaveDraft, isSubmitting = false }: LeaveRequestFormProps) => {
  const [type, setType] = useState<'leave' | 'od'>('leave');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [periods, setPeriods] = useState<number>(1);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;
    
    const requestData: LeaveRequestData = {
      type,
      reason,
      details,
      startDate,
      endDate,
    };
    
    // Add periods for OD requests
    if (type === 'od') {
      requestData.periods = periods;
    }
    
    onSubmit(requestData);
  };
  
  const handleSaveDraft = () => {
    if (!startDate || !reason) return;
    
    const draftData: LeaveRequestData = {
      type,
      reason,
      details,
      startDate,
      endDate: endDate || startDate,
    };
    
    // Add periods for OD requests
    if (type === 'od') {
      draftData.periods = periods;
    }
    
    onSaveDraft?.(draftData);
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>New Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Request Type</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(value: 'leave' | 'od') => setType(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="leave" id="leave" />
                <Label htmlFor="leave" className="cursor-pointer">Leave</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="od" id="od" />
                <Label htmlFor="od" className="cursor-pointer">On Duty (OD)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input 
              id="reason" 
              placeholder={`Enter reason for ${type}`} 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea 
              id="details" 
              placeholder="Provide any additional information" 
              value={details} 
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => 
                      date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                      (startDate ? date < startDate : false)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Periods selector for OD requests */}
          {type === 'od' && (
            <div className="space-y-2">
              <Label htmlFor="periods">Number of Periods/Hours</Label>
              <Select value={periods.toString()} onValueChange={(value) => setPeriods(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select number of periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Period</SelectItem>
                  <SelectItem value="2">2 Periods</SelectItem>
                  <SelectItem value="3">3 Periods</SelectItem>
                  <SelectItem value="4">4 Periods</SelectItem>
                  <SelectItem value="5">5 Periods (Full Day)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Specify how many periods/hours you'll be on duty (maximum 5)
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting || !reason || !startDate}
            >
              Save as Draft
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !reason || !startDate || !endDate}
            className={!onSaveDraft ? "w-full" : ""}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              `Submit ${type === 'leave' ? 'Leave' : 'OD'} Request`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LeaveRequestForm;
