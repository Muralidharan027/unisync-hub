
import React from 'react';
import { useParams } from 'react-router-dom';
import SettingsLayout from '@/layouts/SettingsLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import ActivitySettings from '@/components/settings/ActivitySettings';

export default function StudentSettingsPage() {
  const { section = 'profile' } = useParams<{ section: string }>();

  return (
    <SettingsLayout role="student">
      {section === 'profile' && <ProfileSettings role="student" />}
      {section === 'notifications' && <NotificationSettings role="student" />}
      {section === 'appearance' && <AppearanceSettings />}
      {section === 'security' && <SecuritySettings />}
      {section === 'activity' && <ActivitySettings role="student" />}
    </SettingsLayout>
  );
}
