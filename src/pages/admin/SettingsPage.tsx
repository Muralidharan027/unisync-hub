
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SettingsLayout from '@/layouts/SettingsLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import UserManagementSettings from '@/components/settings/UserManagementSettings';
import ActivitySettings from '@/components/settings/ActivitySettings';

export default function SettingsPage() {
  return (
    <SettingsLayout>
      <Routes>
        <Route path="profile" element={<ProfileSettings role="admin" />} />
        <Route path="notifications" element={<NotificationSettings />} />
        <Route path="appearance" element={<AppearanceSettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="users" element={<UserManagementSettings />} />
        <Route path="activity" element={<ActivitySettings role="admin" />} />
        <Route path="/" element={<Navigate to="profile" replace />} />
        <Route path="*" element={<Navigate to="profile" replace />} />
      </Routes>
    </SettingsLayout>
  );
}
