
import { Announcement } from "@/components/announcements/AnnouncementCard";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";

// Load announcements from localStorage if available
const loadAnnouncements = (): Announcement[] => {
  if (typeof window !== 'undefined') {
    const savedAnnouncements = localStorage.getItem('announcements');
    return savedAnnouncements ? JSON.parse(savedAnnouncements) : [];
  }
  return [];
};

// Initialize global announcements store if not exists
if (typeof window !== 'undefined' && !window.globalAnnouncements) {
  window.globalAnnouncements = loadAnnouncements();
}

// Function to add an announcement
export const addAnnouncement = (announcement: Announcement): void => {
  if (typeof window !== 'undefined') {
    window.globalAnnouncements.push(announcement);
    saveAnnouncements();
  }
};

// Function to update an announcement
export const updateAnnouncement = (id: string, updatedAnnouncement: Partial<Announcement>): void => {
  if (typeof window !== 'undefined') {
    const index = window.globalAnnouncements.findIndex(a => a.id === id);
    if (index !== -1) {
      window.globalAnnouncements[index] = {
        ...window.globalAnnouncements[index],
        ...updatedAnnouncement
      };
      saveAnnouncements();
    }
  }
};

// Function to delete an announcement
export const deleteAnnouncement = (id: string): void => {
  if (typeof window !== 'undefined') {
    window.globalAnnouncements = window.globalAnnouncements.filter(a => a.id !== id);
    saveAnnouncements();
  }
};

// Function to get all announcements
export const getAnnouncements = (): Announcement[] => {
  if (typeof window !== 'undefined') {
    return [...window.globalAnnouncements];
  }
  return [];
};

// Function to save announcements to localStorage
const saveAnnouncements = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('announcements', JSON.stringify(window.globalAnnouncements));
  }
};

// Type declaration for Window interface
declare global {
  interface Window {
    globalAnnouncements: Announcement[];
    globalLeaveRequests: LeaveRequest[];
  }
}
