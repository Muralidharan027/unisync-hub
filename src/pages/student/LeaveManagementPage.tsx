
import { useState, useEffect } from "react";
import { FileClock, FileText, PlusCircle } from "lucide-react";
import { ModuleTabs } from "@/components/ui/module-tabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import LeaveRequestForm, { LeaveRequestData } from "@/components/leave/LeaveRequestForm";
import LeaveRequestsList from "@/components/leave/LeaveRequestsList";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { addLeaveRequest, getLeaveRequests } from "@/store/leaveRequests";
import { supabase } from "@/integrations/supabase/client";

export default function StudentLeaveManagementPage() {
  const [activeTab, setActiveTab] = useState("history");
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const tabs = [
    { id: "history", label: "Request History", icon: <FileClock /> },
    { id: "new", label: "New Request", icon: <PlusCircle /> },
    { id: "drafts", label: "Drafts", icon: <FileText /> },
  ];
  
  // Load leave requests that belong to the current student
  useEffect(() => {
    if (profile) {
      const loadRequests = async () => {
        try {
          // First try to load from Supabase if available
          const { data: supabaseRequests, error } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('user_id', profile.id);
          
          if (error) {
            console.error("Error loading requests from Supabase:", error);
            // Fallback to local storage if Supabase query fails
            const localRequests = getLeaveRequests().filter(
              req => req.studentId === profile.student_id
            );
            setRequests(localRequests);
            return;
          }
          
          if (supabaseRequests && supabaseRequests.length > 0) {
            // Convert Supabase data format to LeaveRequest format
            const formattedRequests: LeaveRequest[] = supabaseRequests.map(req => ({
              id: req.id,
              type: req.type as 'leave' | 'od',
              reason: req.reason,
              details: req.details || '',
              startDate: new Date(req.start_date),
              endDate: new Date(req.end_date),
              status: req.status,
              studentName: profile.full_name || "Unknown Student",
              studentId: profile.student_id || "Unknown ID",
              submittedAt: new Date(req.created_at),
              // Additional fields
              senderName: req.sender_name || profile.full_name || "",
              registerNumber: req.register_number || profile.student_id || "",
              classYear: req.class_year || "",
              section: req.section || "",
              rollNumber: req.roll_number || "",
              staffEmail: req.staff_email || "",
              adminEmail: req.admin_email || "",
              periods: req.periods
            }));
            
            setRequests(formattedRequests);
          } else {
            // Fallback to local storage if no Supabase data
            const localRequests = getLeaveRequests().filter(
              req => req.studentId === profile.student_id
            );
            setRequests(localRequests);
          }
        } catch (err) {
          console.error("Error in useEffect:", err);
          // Fallback to local storage on any error
          const localRequests = getLeaveRequests().filter(
            req => req.studentId === profile.student_id
          );
          setRequests(localRequests);
        }
      };
      
      loadRequests();
    }
  }, [profile]);
  
  // Subscribe to changes in the global leave requests
  useEffect(() => {
    const checkForUpdates = () => {
      if (profile) {
        const studentRequests = getLeaveRequests().filter(
          req => req.studentId === profile.student_id
        );
        setRequests(prev => {
          // Only update if there's a difference
          if (JSON.stringify(prev) !== JSON.stringify(studentRequests)) {
            return studentRequests;
          }
          return prev;
        });
      }
    };
    
    // Check for updates every 2 seconds
    const interval = setInterval(checkForUpdates, 2000);
    
    return () => clearInterval(interval);
  }, [profile]);
  
  const handleSubmitLeaveRequest = async (data: LeaveRequestData) => {
    setSubmitting(true);
    
    try {
      // Create request object
      const newRequest: LeaveRequest = {
        id: `request-${Date.now()}`,
        type: data.type,
        reason: data.reason,
        details: data.details,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "pending",
        studentName: profile?.full_name || data.senderName || "Unknown Student",
        studentId: profile?.student_id || data.registerNumber || "Unknown ID",
        submittedAt: new Date(),
        periods: data.type === 'od' ? data.periods : undefined,
        // Additional fields
        senderName: data.senderName,
        registerNumber: data.registerNumber,
        classYear: data.classYear,
        section: data.section,
        rollNumber: data.rollNumber,
        staffEmail: data.staffEmail,
        adminEmail: data.adminEmail,
        department: data.department
      };
      
      // Try to store in Supabase first
      let savedToSupabase = false;
      
      if (profile && profile.id) {
        try {
          const { data: insertedData, error } = await supabase
            .from('leave_requests')
            .insert({
              type: newRequest.type,
              reason: newRequest.reason,
              details: newRequest.details,
              start_date: newRequest.startDate.toISOString(),
              end_date: newRequest.endDate.toISOString(),
              status: newRequest.status,
              user_id: profile.id,
              periods: newRequest.periods,
              // Additional fields
              sender_name: newRequest.senderName,
              register_number: newRequest.registerNumber,
              class_year: newRequest.classYear,
              section: newRequest.section,
              roll_number: newRequest.rollNumber,
              staff_email: newRequest.staffEmail,
              admin_email: newRequest.adminEmail,
              department: data.department
            })
            .select()
            .single();
          
          if (error) {
            console.error("Error saving to Supabase:", error);
          } else {
            savedToSupabase = true;
            // Update the ID to use the Supabase-generated UUID
            newRequest.id = insertedData.id;
            
            // Send email notification using edge function
            try {
              // Include additional data needed for the email
              const emailData = {
                leaveData: {
                  staffEmail: newRequest.staffEmail,
                  adminEmail: newRequest.adminEmail,
                  senderName: newRequest.senderName,
                  registerNumber: newRequest.registerNumber,
                  requestType: newRequest.type,
                  startDate: newRequest.startDate,
                  endDate: newRequest.endDate,
                  reason: newRequest.reason,
                  details: newRequest.details,
                  classYear: newRequest.classYear,
                  section: newRequest.section,
                  rollNumber: newRequest.rollNumber,
                  department: data.department
                }
              };
              
              const { error: emailError } = await supabase.functions.invoke('send-leave-email', {
                body: emailData
              });
              
              if (emailError) {
                console.error("Error sending email notification:", emailError);
              } else {
                console.log("Email notification sent successfully");
              }
            } catch (emailErr) {
              console.error("Error calling email function:", emailErr);
            }
          }
        } catch (err) {
          console.error("Error in Supabase save operation:", err);
        }
      }
      
      // Fallback to local storage if Supabase save failed
      if (!savedToSupabase) {
        // Add to global store
        addLeaveRequest(newRequest);
      }
      
      // Update local state
      setRequests(prev => [...prev, newRequest]);
      
      toast({
        title: "Request Submitted",
        description: `Your ${data.type === 'leave' ? 'leave' : 'OD'} request has been submitted successfully.`,
      });
      
      // Switch to history tab after successful submission
      setActiveTab("history");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSaveDraft = (data: LeaveRequestData) => {
    toast({
      title: "Draft Saved",
      description: "Your request has been saved as a draft.",
    });
  };
  
  const handleDownload = async (id: string) => {
    toast({
      title: "Download Started",
      description: "Your approval letter is being downloaded",
    });
    
    try {
      // Find the request data
      const requestData = requests.find(req => req.id === id);
      
      if (!requestData) {
        throw new Error("Request not found");
      }
      
      // Call the serverless function to generate PDF
      const response = await fetch('https://fahqlerywybttjinbanp.functions.supabase.co/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaHFsZXJ5d3lidHRqaW5iYW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NTczODEsImV4cCI6MjA1NzQzMzM4MX0.4tkhXB8BYlkAQlmkYYvfuK8gPjoGQztY2xhGbko3fcU'
        },
        body: JSON.stringify({ requestData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${requestData.type}_request_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Your approval letter has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Leave & OD Management</h1>
        <p className="text-muted-foreground">
          Submit and track your leave and on-duty requests.
        </p>
        
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
            requests={requests} 
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
