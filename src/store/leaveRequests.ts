
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";

// Load requests from localStorage if available
const loadLeaveRequests = (): LeaveRequest[] => {
  if (typeof window !== 'undefined') {
    const savedRequests = localStorage.getItem('leaveRequests');
    return savedRequests ? JSON.parse(savedRequests) : [];
  }
  return [];
};

// Initialize global leave requests store if not exists
if (typeof window !== 'undefined' && !window.globalLeaveRequests) {
  window.globalLeaveRequests = loadLeaveRequests();
}

// Function to add a leave request
export const addLeaveRequest = (request: LeaveRequest): void => {
  if (typeof window !== 'undefined') {
    window.globalLeaveRequests.push(request);
    saveLeaveRequests();
  }
};

// Function to update a leave request
export const updateLeaveRequest = (id: string, updatedRequest: Partial<LeaveRequest>): void => {
  if (typeof window !== 'undefined') {
    const index = window.globalLeaveRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      window.globalLeaveRequests[index] = {
        ...window.globalLeaveRequests[index],
        ...updatedRequest
      };
      saveLeaveRequests();
    }
  }
};

// Function to delete a leave request
export const deleteLeaveRequest = (id: string): void => {
  if (typeof window !== 'undefined') {
    window.globalLeaveRequests = window.globalLeaveRequests.filter(r => r.id !== id);
    saveLeaveRequests();
  }
};

// Function to get all leave requests
export const getLeaveRequests = (): LeaveRequest[] => {
  if (typeof window !== 'undefined') {
    return [...window.globalLeaveRequests];
  }
  return [];
};

// Function to save leave requests to localStorage
const saveLeaveRequests = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('leaveRequests', JSON.stringify(window.globalLeaveRequests));
  }
};

// Type declaration for Window interface
declare global {
  interface Window {
    globalLeaveRequests: LeaveRequest[];
  }
}
