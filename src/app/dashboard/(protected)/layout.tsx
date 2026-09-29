import { ReactNode } from 'react';
import { DashboardSessionGate } from '@/components/dashboard/DashboardSessionGate';

export default function ProtectedDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardSessionGate>
      {children}
    </DashboardSessionGate>
  );
}
