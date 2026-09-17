'use client';

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ResumeActivityChart({ data }: { data: Array<{ date: string; views: number; downloads: number }> }) {
  return <ResponsiveContainer width="100%" height={260}><LineChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: -18 }}><CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} /><XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: '#111113', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }} /><Legend wrapperStyle={{ color: '#d4d4d8', fontSize: 12 }} /><Line type="monotone" dataKey="views" name="Views" stroke="#4F8CFF" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="downloads" name="Downloads" stroke="#34d399" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>;
}
