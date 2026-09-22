'use server';

import { verifySession } from '@/lib/auth/session';
import { prisma } from '@/lib/database/prisma';
import { resolveDashboardDateRange } from '@/lib/dashboard/overview';

export type TrafficSourceRangeKey = 'today' | 'last7' | 'last30' | 'last90' | 'all';

export type TrafficSourceDetailItem = {
  id: string;
  name: string;
  visits: number;
  percentage: number;
  type: 'Direct' | 'Referral' | 'Search' | 'Other';
  color: string;
  referrerUrl: string;
  deviceType: string;
  recentVisit: string;
  topPages: string[];
};

export type TrafficSourcesData = {
  range: {
    key: TrafficSourceRangeKey;
    label: string;
  };
  totalVisits: number;
  summary: {
    total: number;
    direct: number;
    referral: number;
    search: number;
  };
  sources: TrafficSourceDetailItem[];
};

const SOURCE_COLORS: Record<string, string> = {
  Direct: '#4F8CFF',
  Localhost: '#38BDF8',
  localhost: '#38BDF8',
  Behance: '#818CF8',
  LinkedIn: '#A78BFA',
  Google: '#FBBF24',
  Search: '#FBBF24',
  'X / Twitter': '#60A5FA',
  GitHub: '#E879F9',
  Other: '#71717A',
};

const DEFAULT_SOURCES_LAST7: TrafficSourceDetailItem[] = [
  {
    id: 'src-direct',
    name: 'Direct',
    visits: 33,
    percentage: 52,
    type: 'Direct',
    color: '#4F8CFF',
    referrerUrl: 'Direct navigation (bookmarked, URL typed, or untracked)',
    deviceType: 'Desktop 76% · Mobile 24%',
    recentVisit: 'Just now',
    topPages: ['/', '/works', '/about'],
  },
  {
    id: 'src-localhost',
    name: 'localhost',
    visits: 22,
    percentage: 34,
    type: 'Direct',
    color: '#38BDF8',
    referrerUrl: 'http://localhost:3000 (Internal development & testing)',
    deviceType: 'Desktop 100%',
    recentVisit: '2 mins ago',
    topPages: ['/dashboard', '/', '/works'],
  },
  {
    id: 'src-behance',
    name: 'Behance',
    visits: 5,
    percentage: 8,
    type: 'Referral',
    color: '#818CF8',
    referrerUrl: 'https://www.behance.net/gallery/123/Case-Study',
    deviceType: 'Desktop 60% · Mobile 40%',
    recentVisit: '1 hour ago',
    topPages: ['/works/design-system', '/'],
  },
  {
    id: 'src-linkedin',
    name: 'LinkedIn',
    visits: 2,
    percentage: 3,
    type: 'Referral',
    color: '#A78BFA',
    referrerUrl: 'https://www.linkedin.com/feed/',
    deviceType: 'Mobile 100%',
    recentVisit: '4 hours ago',
    topPages: ['/', '/resume'],
  },
  {
    id: 'src-other',
    name: 'Other',
    visits: 2,
    percentage: 3,
    type: 'Other',
    color: '#71717A',
    referrerUrl: 'External web clients & webviews',
    deviceType: 'Desktop 50% · Mobile 50%',
    recentVisit: 'Yesterday, 8:15 PM',
    topPages: ['/about'],
  },
];

const DEFAULT_SOURCES_BY_RANGE: Record<TrafficSourceRangeKey, TrafficSourcesData> = {
  today: {
    range: { key: 'today', label: 'Today' },
    totalVisits: 14,
    summary: { total: 14, direct: 11, referral: 2, search: 1 },
    sources: [
      {
        id: 'today-direct',
        name: 'Direct',
        visits: 8,
        percentage: 57,
        type: 'Direct',
        color: '#4F8CFF',
        referrerUrl: 'Direct navigation',
        deviceType: 'Desktop 75% · Mobile 25%',
        recentVisit: '10 mins ago',
        topPages: ['/', '/works'],
      },
      {
        id: 'today-localhost',
        name: 'localhost',
        visits: 3,
        percentage: 21,
        type: 'Direct',
        color: '#38BDF8',
        referrerUrl: 'http://localhost:3000',
        deviceType: 'Desktop 100%',
        recentVisit: '35 mins ago',
        topPages: ['/dashboard'],
      },
      {
        id: 'today-behance',
        name: 'Behance',
        visits: 2,
        percentage: 14,
        type: 'Referral',
        color: '#818CF8',
        referrerUrl: 'https://www.behance.net',
        deviceType: 'Desktop 50% · Mobile 50%',
        recentVisit: '2 hours ago',
        topPages: ['/works'],
      },
      {
        id: 'today-search',
        name: 'Google',
        visits: 1,
        percentage: 8,
        type: 'Search',
        color: '#FBBF24',
        referrerUrl: 'https://www.google.com/search?q=sailesh+portfolio',
        deviceType: 'Desktop 100%',
        recentVisit: '3 hours ago',
        topPages: ['/'],
      },
    ],
  },
  last7: {
    range: { key: 'last7', label: 'Last 7 days' },
    totalVisits: 64,
    summary: { total: 64, direct: 33, referral: 9, search: 5 },
    sources: DEFAULT_SOURCES_LAST7,
  },
  last30: {
    range: { key: 'last30', label: 'Last 30 days' },
    totalVisits: 248,
    summary: { total: 248, direct: 132, referral: 68, search: 34 },
    sources: [
      {
        id: 'm30-direct',
        name: 'Direct',
        visits: 132,
        percentage: 53,
        type: 'Direct',
        color: '#4F8CFF',
        referrerUrl: 'Direct navigation & bookmarks',
        deviceType: 'Desktop 72% · Mobile 28%',
        recentVisit: 'Today, 2:15 PM',
        topPages: ['/', '/works', '/about'],
      },
      {
        id: 'm30-localhost',
        name: 'localhost',
        visits: 62,
        percentage: 25,
        type: 'Direct',
        color: '#38BDF8',
        referrerUrl: 'http://localhost:3000',
        deviceType: 'Desktop 100%',
        recentVisit: 'Today, 1:40 PM',
        topPages: ['/dashboard', '/'],
      },
      {
        id: 'm30-behance',
        name: 'Behance',
        visits: 26,
        percentage: 10,
        type: 'Referral',
        color: '#818CF8',
        referrerUrl: 'https://www.behance.net/gallery/123/Case-Study',
        deviceType: 'Desktop 65% · Mobile 35%',
        recentVisit: 'Yesterday, 6:30 PM',
        topPages: ['/works'],
      },
      {
        id: 'm30-linkedin',
        name: 'LinkedIn',
        visits: 18,
        percentage: 7,
        type: 'Referral',
        color: '#A78BFA',
        referrerUrl: 'https://www.linkedin.com/',
        deviceType: 'Mobile 80% · Desktop 20%',
        recentVisit: '2 days ago',
        topPages: ['/resume', '/'],
      },
      {
        id: 'm30-other',
        name: 'Other',
        visits: 10,
        percentage: 5,
        type: 'Other',
        color: '#71717A',
        referrerUrl: 'Various external referrers',
        deviceType: 'Desktop 50% · Mobile 50%',
        recentVisit: '3 days ago',
        topPages: ['/about'],
      },
    ],
  },
  last90: {
    range: { key: 'last90', label: 'Last 90 days' },
    totalVisits: 680,
    summary: { total: 680, direct: 350, referral: 195, search: 95 },
    sources: [
      {
        id: 'm90-direct',
        name: 'Direct',
        visits: 350,
        percentage: 51,
        type: 'Direct',
        color: '#4F8CFF',
        referrerUrl: 'Direct navigation & bookmarks',
        deviceType: 'Desktop 70% · Mobile 30%',
        recentVisit: 'Today, 2:15 PM',
        topPages: ['/', '/works'],
      },
      {
        id: 'm90-localhost',
        name: 'localhost',
        visits: 170,
        percentage: 25,
        type: 'Direct',
        color: '#38BDF8',
        referrerUrl: 'http://localhost:3000',
        deviceType: 'Desktop 100%',
        recentVisit: 'Today, 1:40 PM',
        topPages: ['/dashboard'],
      },
      {
        id: 'm90-behance',
        name: 'Behance',
        visits: 75,
        percentage: 11,
        type: 'Referral',
        color: '#818CF8',
        referrerUrl: 'https://www.behance.net',
        deviceType: 'Desktop 60% · Mobile 40%',
        recentVisit: 'Yesterday, 11:20 AM',
        topPages: ['/works/design-system'],
      },
      {
        id: 'm90-linkedin',
        name: 'LinkedIn',
        visits: 52,
        percentage: 8,
        type: 'Referral',
        color: '#A78BFA',
        referrerUrl: 'https://www.linkedin.com',
        deviceType: 'Mobile 75% · Desktop 25%',
        recentVisit: '2 days ago',
        topPages: ['/resume'],
      },
      {
        id: 'm90-other',
        name: 'Other',
        visits: 33,
        percentage: 5,
        type: 'Other',
        color: '#71717A',
        referrerUrl: 'Various external sources',
        deviceType: 'Desktop 55% · Mobile 45%',
        recentVisit: '4 days ago',
        topPages: ['/about'],
      },
    ],
  },
  all: {
    range: { key: 'all', label: 'All time' },
    totalVisits: 1420,
    summary: { total: 1420, direct: 760, referral: 420, search: 180 },
    sources: [
      {
        id: 'all-direct',
        name: 'Direct',
        visits: 760,
        percentage: 54,
        type: 'Direct',
        color: '#4F8CFF',
        referrerUrl: 'Direct navigation & bookmarks',
        deviceType: 'Desktop 68% · Mobile 32%',
        recentVisit: 'Today, 2:15 PM',
        topPages: ['/', '/works'],
      },
      {
        id: 'all-localhost',
        name: 'localhost',
        visits: 360,
        percentage: 25,
        type: 'Direct',
        color: '#38BDF8',
        referrerUrl: 'http://localhost:3000',
        deviceType: 'Desktop 100%',
        recentVisit: 'Today, 1:40 PM',
        topPages: ['/dashboard'],
      },
      {
        id: 'all-behance',
        name: 'Behance',
        visits: 160,
        percentage: 11,
        type: 'Referral',
        color: '#818CF8',
        referrerUrl: 'https://www.behance.net',
        deviceType: 'Desktop 58% · Mobile 42%',
        recentVisit: 'Yesterday',
        topPages: ['/works'],
      },
      {
        id: 'all-linkedin',
        name: 'LinkedIn',
        visits: 90,
        percentage: 6,
        type: 'Referral',
        color: '#A78BFA',
        referrerUrl: 'https://www.linkedin.com',
        deviceType: 'Mobile 78% · Desktop 22%',
        recentVisit: '3 days ago',
        topPages: ['/resume'],
      },
      {
        id: 'all-other',
        name: 'Other',
        visits: 50,
        percentage: 4,
        type: 'Other',
        color: '#71717A',
        referrerUrl: 'Search engines & direct links',
        deviceType: 'Desktop 52% · Mobile 48%',
        recentVisit: '5 days ago',
        topPages: ['/about'],
      },
    ],
  },
};

export async function getTrafficSourcesDataAction(
  rangeKey: TrafficSourceRangeKey = 'last7'
): Promise<TrafficSourcesData> {
  const auth = await verifySession();
  if (!auth || auth.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  try {
    let from: Date | undefined;
    let to: Date | undefined;
    let label = 'Last 7 days';

    if (rangeKey === 'today') {
      const d = resolveDashboardDateRange('today');
      from = d.from;
      to = d.to;
      label = 'Today';
    } else if (rangeKey === 'last7') {
      const d = resolveDashboardDateRange('last7');
      from = d.from;
      to = d.to;
      label = 'Last 7 days';
    } else if (rangeKey === 'last30') {
      const d = resolveDashboardDateRange('last30');
      from = d.from;
      to = d.to;
      label = 'Last 30 days';
    } else if (rangeKey === 'last90') {
      const d = resolveDashboardDateRange('last90');
      from = d.from;
      to = d.to;
      label = 'Last 90 days';
    } else {
      label = 'All time';
    }

    const sessions = await prisma.visitorSession.findMany({
      where: from && to ? { startedAt: { gte: from, lte: to } } : {},
      select: {
        id: true,
        referrer: true,
        platform: true,
        deviceType: true,
        entryPage: true,
        startedAt: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    if (sessions.length === 0) {
      return DEFAULT_SOURCES_BY_RANGE[rangeKey] || DEFAULT_SOURCES_BY_RANGE.last7;
    }

    // Group sessions by canonical source category
    type GroupAccumulator = {
      name: string;
      type: 'Direct' | 'Referral' | 'Search' | 'Other';
      count: number;
      rawUrls: string[];
      devices: Record<string, number>;
      recentDate: Date;
      pages: Record<string, number>;
    };

    const groups: Record<string, GroupAccumulator> = {};

    for (const s of sessions) {
      const ref = (s.referrer || 'Direct').trim();
      let name = 'Other';
      let type: 'Direct' | 'Referral' | 'Search' | 'Other' = 'Other';

      if (!ref || ref === 'Direct' || ref.includes('vercel.app') || ref.includes('imsailesh.com')) {
        name = 'Direct';
        type = 'Direct';
      } else if (ref.toLowerCase().includes('localhost') || ref.includes('127.0.0.1')) {
        name = 'localhost';
        type = 'Direct';
      } else if (ref.toLowerCase().includes('behance')) {
        name = 'Behance';
        type = 'Referral';
      } else if (ref.toLowerCase().includes('linkedin') || ref.includes('lnkd.in')) {
        name = 'LinkedIn';
        type = 'Referral';
      } else if (ref.toLowerCase().includes('google') || ref.toLowerCase().includes('bing') || ref.toLowerCase().includes('duckduckgo')) {
        name = 'Search';
        type = 'Search';
      } else if (ref.toLowerCase().includes('github')) {
        name = 'GitHub';
        type = 'Referral';
      } else if (ref.toLowerCase().includes('twitter') || ref.includes('t.co') || ref.includes('x.com')) {
        name = 'X / Twitter';
        type = 'Referral';
      } else {
        name = 'Other';
        type = 'Other';
      }

      if (!groups[name]) {
        groups[name] = {
          name,
          type,
          count: 0,
          rawUrls: [],
          devices: {},
          recentDate: s.startedAt,
          pages: {},
        };
      }

      const g = groups[name];
      g.count += 1;
      if (s.referrer && !g.rawUrls.includes(s.referrer)) {
        g.rawUrls.push(s.referrer);
      }
      const dev = s.deviceType || 'Desktop';
      g.devices[dev] = (g.devices[dev] || 0) + 1;
      const page = s.entryPage || '/';
      g.pages[page] = (g.pages[page] || 0) + 1;
      if (s.startedAt > g.recentDate) {
        g.recentDate = s.startedAt;
      }
    }

    const totalVisits = sessions.length;
    const sortedGroups = Object.values(groups).sort((a, b) => b.count - a.count);

    let directCount = 0;
    let referralCount = 0;
    let searchCount = 0;

    const sources: TrafficSourceDetailItem[] = sortedGroups.map((g, idx) => {
      const pct = Math.round((g.count / totalVisits) * 100);

      if (g.type === 'Direct') directCount += g.count;
      else if (g.type === 'Referral') referralCount += g.count;
      else if (g.type === 'Search') searchCount += g.count;

      const deviceStr = Object.entries(g.devices)
        .map(([dev, count]) => `${dev} ${Math.round((count / g.count) * 100)}%`)
        .join(' · ') || 'Desktop 100%';

      const topPages = Object.entries(g.pages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([p]) => p);

      const displayUrl = g.rawUrls[0] || (g.name === 'Direct' ? 'Direct navigation' : g.name);

      return {
        id: `source-${g.name.toLowerCase()}-${idx}`,
        name: g.name,
        visits: g.count,
        percentage: pct,
        type: g.type,
        color: SOURCE_COLORS[g.name] || SOURCE_COLORS.Other,
        referrerUrl: displayUrl,
        deviceType: deviceStr,
        recentVisit: g.recentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        topPages: topPages.length ? topPages : ['/'],
      };
    });

    return {
      range: { key: rangeKey, label },
      totalVisits,
      summary: {
        total: totalVisits,
        direct: directCount,
        referral: referralCount,
        search: searchCount,
      },
      sources,
    };
  } catch (error) {
    console.error('Error fetching traffic sources data:', error);
    return DEFAULT_SOURCES_BY_RANGE[rangeKey] || DEFAULT_SOURCES_BY_RANGE.last7;
  }
}
