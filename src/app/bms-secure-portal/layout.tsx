import React from 'react';
import AdminAuthGate from '@/components/admin/AdminAuthGate';

export const metadata = {
  title: 'BMS Secure Portal | System Gate',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BmsSecurePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      {children}
    </AdminAuthGate>
  );
}
