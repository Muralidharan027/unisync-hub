
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SettingsLayout from '@/layouts/SettingsLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import ActivitySettings from '@/components/settings/ActivitySettings';

export default function SettingsPage() {
  return (
    <SettingsLayout>
      <Routes>
        <Route path="profile" element={<ProfileSettings role="staff" />} />
        <Route path="notifications" element={<NotificationSettings />} />
        <Route path="appearance" element={<AppearanceSettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="activity" element={<ActivitySettings role="staff" />} />
        <Route path="/" element={<Navigate to="profile" replace />} />
        <Route path="*" element={<Navigate to="profile" replace />} />
      </Routes>
    </SettingsLayout>
  );
}
