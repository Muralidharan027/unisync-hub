
import React from 'react';
import { useParams } from 'react-router-dom';
import SettingsLayout from '@/layouts/SettingsLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import ActivitySettings from '@/components/settings/ActivitySettings';

export default function StaffSettingsPage() {
  const { section = 'profile' } = useParams<{ section: string }>();

  return (
    <SettingsLayout role="staff">
      {section === 'profile' && <ProfileSettings role="staff" />}
      {section === 'notifications' && <NotificationSettings role="staff" />}
      {section === 'appearance' && <AppearanceSettings />}
      {section === 'security' && <SecuritySettings />}
      {section === 'activity' && <ActivitySettings role="staff" />}
    </SettingsLayout>
  );
}
