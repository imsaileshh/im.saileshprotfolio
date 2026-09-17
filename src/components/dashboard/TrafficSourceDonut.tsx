'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const colors = ['#4F8CFF', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];

export function TrafficSourceDonut({ data }: { data: Array<{ referrer: string; sessions: number }> }) {
  return <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={data} dataKey="sessions" nameKey="referrer" innerRadius={48} outerRadius={70} paddingAngle={3}>{data.map((item, index) => <Cell key={item.referrer} fill={colors[index % colors.length]} />)}</Pie><Tooltip contentStyle={{ background: '#111113', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }} /></PieChart></ResponsiveContainer>;
}
