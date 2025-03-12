
import { useState } from "react";
import { FileClock, FileText, PlusCircle } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestForm, { LeaveRequestData } from "@/components/leave/LeaveRequestForm";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";
import { useToast } from "@/hooks/use-toast";

// Mock data for leave requests
const mockRequests: LeaveRequest[] = [
  {
    id: "1",
    type: "leave",
    reason: "Family function",
    details: "Need to attend a family wedding in my hometown.",
    startDate: new Date("2023-11-20"),
    endDate: new Date("2023-11-22"),
    status: "approved",
    studentName: "John Doe",
    studentId: "CS2021001",
    submittedAt: new Date("2023-11-10"),
  },
  {
    id: "2",
    type: "od",
    reason: "Hackathon participation",
    details: "Selected to represent the college in the national level hackathon at IIT Madras.",
    startDate: new Date("2023-12-01"),
    endDate: new Date("2023-12-03"),
    status: "pending",
    studentName: "John Doe",
    studentId: "CS2021001",
    submittedAt: new Date("2023-11-15"),
  },
  {
    id: "3",
    type: "leave",
    reason: "Medical leave",
    details: "Having fever and doctor advised to take rest for 2 days.",
    startDate: new Date("2023-11-05"),
    endDate: new Date("2023-11-07"),
    status: "rejected",
    studentName: "John Doe",
    studentId: "CS2021001",
    submittedAt: new Date("2023-11-04"),
  },
  {
    id: "4",
    type: "od",
    reason: "Workshop attendance",
    details: "Attending a workshop on cloud computing hosted by AWS.",
    startDate: new Date("2023-10-15"),
    endDate: new Date("2023-10-15"),
    status: "acknowledged",
    studentName: "John Doe",
    studentId: "CS2021001",
    submittedAt: new Date("2023-10-10"),
  },
];

export default function StudentLeaveManagementPage() {
  const [activeTab, setActiveTab] = useState("history");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const tabs = [
    { id: "history", label: "Request History", icon: <FileClock /> },
    { id: "new", label: "New Request", icon: <PlusCircle /> },
    { id: "drafts", label: "Drafts", icon: <FileText /> },
  ];
  
  const handleSubmitLeaveRequest = (data: LeaveRequestData) => {
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Request Submitted",
        description: `Your ${data.type === 'leave' ? 'leave' : 'OD'} request has been submitted successfully.`,
      });
      
      // Switch to history tab after successful submission
      setActiveTab("history");
    }, 1500);
  };
  
  const handleSaveDraft = (data: LeaveRequestData) => {
    toast({
      title: "Draft Saved",
      description: "Your request has been saved as a draft.",
    });
  };
  
  const handleDownload = (id: string) => {
    toast({
      title: "Download Started",
      description: "Your approval letter is being downloaded",
    });
  };
  
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave & OD Management</h1>
          <p className="text-muted-foreground">
            Submit and track your leave and on-duty requests.
          </p>
        </div>
        
        <ModuleTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === "new" ? (
          <LeaveRequestForm 
            onSubmit={handleSubmitLeaveRequest}
            onSaveDraft={handleSaveDraft}
            isSubmitting={submitting}
          />
        ) : activeTab === "history" ? (
          <LeaveRequestsList 
            requests={mockRequests} 
            role="student"
            onDownload={handleDownload}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            You have no saved drafts.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
