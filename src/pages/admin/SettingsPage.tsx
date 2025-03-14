
import React from 'react';
import { useParams } from 'react-router-dom';
import SettingsLayout from '@/layouts/SettingsLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import ActivitySettings from '@/components/settings/ActivitySettings';
import UserManagementSettings from '@/components/settings/UserManagementSettings';

export default function AdminSettingsPage() {
  const { section = 'profile' } = useParams<{ section: string }>();

  return (
    <SettingsLayout role="admin">
      {section === 'profile' && <ProfileSettings role="admin" />}
      {section === 'notifications' && <NotificationSettings role="admin" />}
      {section === 'security' && <SecuritySettings />}
      {section === 'activity' && <ActivitySettings role="admin" />}
      {section === 'user-management' && <UserManagementSettings />}
    </SettingsLayout>
  );
}
