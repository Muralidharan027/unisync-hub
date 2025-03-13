
import { Announcement } from "@/components/announcements/AnnouncementCard";

// Initialize global announcements store if not exists
if (typeof window !== 'undefined' && !window.globalAnnouncements) {
  window.globalAnnouncements = [] as Announcement[];
}

// Function to add an announcement
export const addAnnouncement = (announcement: Announcement): void => {
  if (typeof window !== 'undefined') {
    window.globalAnnouncements.push(announcement);
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
    }
  }
};

// Function to delete an announcement
export const deleteAnnouncement = (id: string): void => {
  if (typeof window !== 'undefined') {
    window.globalAnnouncements = window.globalAnnouncements.filter(a => a.id !== id);
  }
};

// Function to get all announcements
export const getAnnouncements = (): Announcement[] => {
  if (typeof window !== 'undefined') {
    return [...window.globalAnnouncements];
  }
  return [];
};

// Type declaration for Window interface
declare global {
  interface Window {
    globalAnnouncements: Announcement[];
    globalLeaveRequests: LeaveRequest[];
  }
}
