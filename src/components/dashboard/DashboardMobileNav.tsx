'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { navigationGroups } from './Sidebar';

export function DashboardMobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/dashboard/login');
  }

  return <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-[#0e0e10] px-4 py-3 md:hidden"><span className="text-base font-bold tracking-tight text-white">Sailesh P <span className="ml-1 rounded-full bg-[#4F8CFF]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4F8CFF]">Admin</span></span><details className="relative"><summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300"><Menu size={16} /> Menu</summary><div className="absolute right-0 top-12 z-50 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-white/10 bg-[#111113] p-3 shadow-2xl">{navigationGroups.flatMap((group) => group.items).map((item) => { const path = item.href.split('?')[0]; const active = path === '/dashboard' ? pathname === path : pathname.startsWith(path); return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}><item.icon className="h-4 w-4" />{item.name}</Link>; })}<Link href="/dashboard/settings" className="mt-2 flex items-center gap-3 border-t border-white/5 px-3 py-3 text-sm text-zinc-400 hover:text-white">Settings</Link><button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-zinc-400 hover:text-red-400"><LogOut className="h-4 w-4" /> Log out</button></div></details></div>;
}
