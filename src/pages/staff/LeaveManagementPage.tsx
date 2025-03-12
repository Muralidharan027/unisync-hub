
import { useState } from "react";
import { FileCheck, FileClock } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import DashboardLayout from "@/layouts/DashboardLayout";
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
    status: "pending",
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
    studentName: "Jane Smith",
    studentId: "CS2021005",
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
    studentName: "Robert Johnson",
    studentId: "CS2021010",
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
    studentName: "Emily Brown",
    studentId: "CS2021015",
    submittedAt: new Date("2023-10-10"),
  },
];

export default function StaffLeaveManagementPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();
  
  const tabs = [
    { id: "pending", label: "Pending Requests", icon: <FileClock /> },
    { id: "processed", label: "Processed Requests", icon: <FileCheck /> },
  ];
  
  const pendingRequests = mockRequests.filter(
    r => r.status === "pending"
  );
  
  const processedRequests = mockRequests.filter(
    r => r.status !== "pending"
  );
  
  const handleApprove = (id: string) => {
    toast({
      title: "Request Approved",
      description: "The leave request has been approved successfully.",
    });
  };
  
  const handleReject = (id: string) => {
    toast({
      title: "Request Rejected",
      description: "The leave request has been rejected.",
    });
  };
  
  const handleAcknowledge = (id: string) => {
    toast({
      title: "Request Acknowledged",
      description: "The OD request has been acknowledged and sent to admin for approval.",
    });
  };
  
  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave & OD Management</h1>
          <p className="text-muted-foreground">
            Process and manage student leave and on-duty requests.
          </p>
        </div>
        
        <ModuleTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === "pending" ? (
          <LeaveRequestsList 
            requests={pendingRequests} 
            role="staff"
            onApprove={handleApprove}
            onReject={handleReject}
            onAcknowledge={handleAcknowledge}
          />
        ) : (
          <LeaveRequestsList 
            requests={processedRequests} 
            role="staff"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
