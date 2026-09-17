'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings,
  LogOut,
  BarChart3,
  Activity,
  Route,
  LayoutTemplate
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export const navigationGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    title: 'Workspace',
    items: [
      { name: 'Works', href: '/dashboard/projects', icon: FolderGit2, exact: false },
      { name: 'Personal Projects', href: '/dashboard/personal-projects', icon: Code2, exact: false },
    ]
  },
  {
    title: 'Content',
    items: [
      { name: 'Resumes', href: '/dashboard/resume', icon: FileText, exact: false },
      { name: 'Hero', href: '/dashboard/hero', icon: LayoutTemplate, exact: false },
      { name: 'Stack', href: '/dashboard/stack', icon: Code2, exact: false },
      { name: 'Experience', href: '/dashboard/experience', icon: Briefcase, exact: false },
      { name: 'Education', href: '/dashboard/education', icon: GraduationCap, exact: false },
      { name: 'About', href: '/dashboard/about', icon: Users, exact: false },
    ]
  },
  {
    title: 'Activity',
    items: [
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, exact: false },
      { name: 'Live Traffic', href: '/dashboard/live', icon: Activity, exact: false },
      { name: 'Visitors', href: '/dashboard/visitors', icon: Users, exact: false },
      { name: 'Resume Analytics', href: '/dashboard/resume?view=analytics', icon: FileText, exact: false },
      { name: 'Journeys', href: '/dashboard/journeys', icon: Route, exact: false },
      { name: 'Inbox', href: '/dashboard/messages', icon: MessageSquare, exact: false },
    ]
  }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/dashboard/login');
  };

  return (
    <div className="flex w-64 flex-col bg-[#0e0e10] border-r border-white/5">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-lg font-bold tracking-tight text-white">Sailesh P</span>
        <span className="ml-2 rounded-full bg-[#4F8CFF]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4F8CFF]">Admin</span>
      </div>
      
      <nav className="flex flex-1 flex-col px-4 pb-6 overflow-y-auto mt-4 scrollbar-hide">
        <div className="flex-1 space-y-8">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.exact 
                    ? pathname === item.href 
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={classNames(
                          isActive
                            ? 'bg-white/10 text-white font-semibold'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                          'group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm transition-colors'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white',
                            'h-4 w-4 shrink-0 transition-colors'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-1 pt-6 border-t border-white/5">
          <Link
            href="/dashboard/settings"
            className={classNames(
              pathname.startsWith('/dashboard/settings')
                ? 'bg-white/10 text-white font-semibold'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white',
              'group flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-sm transition-colors'
            )}
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0 transition-colors" aria-hidden="true" />
            Log out
          </button>
        </div>
      </nav>
    </div>
  );
}
