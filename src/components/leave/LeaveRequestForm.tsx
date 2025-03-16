
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
import { validateRegisterNumber, validateEmail } from "@/utils/validation";
import { useAuth } from "@/contexts/AuthContext";

export type LeaveRequestData = {
  type: 'leave' | 'od';
  reason: string;
  details: string;
  startDate: Date;
  endDate: Date;
  periods?: number; // Number of periods for OD (1-5)
  // New fields
  senderName: string;
  registerNumber: string;
  classYear: string;
  section: string;
  rollNumber: string;
  staffEmail: string;
  adminEmail: string;
  department?: string;
  email?: string;
};

type LeaveRequestFormProps = {
  onSubmit: (data: LeaveRequestData) => void;
  onSaveDraft?: (data: LeaveRequestData) => void;
  isSubmitting?: boolean;
};

const LeaveRequestForm = ({ onSubmit, onSaveDraft, isSubmitting = false }: LeaveRequestFormProps) => {
  const { profile } = useAuth();
  
  const [type, setType] = useState<'leave' | 'od'>('leave');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [periods, setPeriods] = useState<number>(1);
  
  // New fields
  const [senderName, setSenderName] = useState(profile?.full_name || '');
  const [registerNumber, setRegisterNumber] = useState(profile?.student_id || '');
  const [classYear, setClassYear] = useState('');
  const [section, setSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [department, setDepartment] = useState(profile?.department || 'Computer Science');
  
  // Field validation errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!senderName) newErrors.senderName = "Name is required";
    
    if (!registerNumber) {
      newErrors.registerNumber = "Register number is required";
    } else if (!validateRegisterNumber(registerNumber)) {
      newErrors.registerNumber = "Register number must be 13 digits";
    }
    
    if (!classYear) newErrors.classYear = "Class year is required";
    if (!section) newErrors.section = "Section is required";
    if (!rollNumber) newErrors.rollNumber = "Roll number is required";
    
    if (!staffEmail) {
      newErrors.staffEmail = "Staff email is required";
    } else if (!validateEmail(staffEmail)) {
      newErrors.staffEmail = "Invalid email format";
    }
    
    if (!adminEmail) {
      newErrors.adminEmail = "Admin email is required";
    } else if (!validateEmail(adminEmail)) {
      newErrors.adminEmail = "Invalid email format";
    }
    
    if (!reason) newErrors.reason = "Reason is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const requestData: LeaveRequestData = {
      type,
      reason,
      details,
      startDate: startDate!,
      endDate: endDate!,
      senderName,
      registerNumber,
      classYear,
      section,
      rollNumber,
      staffEmail,
      adminEmail,
      department,
      email: profile?.email
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
      senderName,
      registerNumber,
      classYear,
      section,
      rollNumber,
      staffEmail,
      adminEmail,
      department,
      email: profile?.email
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
          
          {/* Student Information Section */}
          <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium mb-4">Student Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="senderName">Full Name</Label>
                <Input 
                  id="senderName" 
                  placeholder="Enter your full name" 
                  value={senderName} 
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                />
                {errors.senderName && <p className="text-xs text-red-500">{errors.senderName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registerNumber">Register Number</Label>
                <Input 
                  id="registerNumber" 
                  placeholder="Enter 13-digit register number" 
                  value={registerNumber} 
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  maxLength={13}
                  required
                />
                {errors.registerNumber && <p className="text-xs text-red-500">{errors.registerNumber}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classYear">Class Year</Label>
                <Select value={classYear} onValueChange={setClassYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                  </SelectContent>
                </Select>
                {errors.classYear && <p className="text-xs text-red-500">{errors.classYear}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
                {errors.section && <p className="text-xs text-red-500">{errors.section}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input 
                  id="rollNumber" 
                  placeholder="Enter roll number" 
                  value={rollNumber} 
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
                {errors.rollNumber && <p className="text-xs text-red-500">{errors.rollNumber}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  placeholder="Enter department" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Email Recipients Section */}
          <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium mb-4">Email Recipients</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="staffEmail">Staff Email</Label>
                <Input 
                  id="staffEmail" 
                  type="email"
                  placeholder="Enter staff email" 
                  value={staffEmail} 
                  onChange={(e) => setStaffEmail(e.target.value)}
                  required
                />
                {errors.staffEmail && <p className="text-xs text-red-500">{errors.staffEmail}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin/HOD Email</Label>
                <Input 
                  id="adminEmail" 
                  type="email"
                  placeholder="Enter admin email" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
                {errors.adminEmail && <p className="text-xs text-red-500">{errors.adminEmail}</p>}
              </div>
            </div>
          </div>
          
          {/* Leave Details Section */}
          <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium mb-4">Leave Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input 
                id="reason" 
                placeholder={`Enter reason for ${type}`} 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                required
              />
              {errors.reason && <p className="text-xs text-red-500">{errors.reason}</p>}
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="details">Additional Details</Label>
              <Textarea 
                id="details" 
                placeholder="Provide any additional information" 
                value={details} 
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 mt-4">
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
                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
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
                {errors.endDate && <p className="text-xs text-red-500">{errors.endDate}</p>}
              </div>
            </div>
            
            {/* Periods selector for OD requests */}
            {type === 'od' && (
              <div className="space-y-2 mt-4">
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
          </div>
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
