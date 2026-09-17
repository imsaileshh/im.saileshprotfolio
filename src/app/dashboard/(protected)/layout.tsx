import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardMobileNav } from '@/components/dashboard/DashboardMobileNav';

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authSession = await verifySession();

  if (!authSession) {
    redirect('/dashboard/login');
  }

  if (authSession.user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white md:h-screen md:flex-row md:overflow-hidden">
      <div className="hidden shrink-0 md:flex"><Sidebar user={authSession.user} /></div>
      <DashboardMobileNav />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
