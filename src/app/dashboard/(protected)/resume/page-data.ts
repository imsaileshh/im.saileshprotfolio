import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';
import { getResumeAnalytics, pickParam } from '@/lib/dashboard/data';
import { analyticsQuerySchema } from '@/lib/validation/schemas';
type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export async function loadPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const analyticsView = pickParam(params, 'view') === 'analytics';
  const resumes = await prisma.resume.findMany({
    where: { status: { not: 'Deleted' } },
    orderBy: { updatedAt: 'desc' },
    include: {
      versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
      analyses: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  const activeCount = resumes.filter((resume) => resume.status === 'Active').length;
  const latestScore = resumes.map((resume) => resume.analyses[0]?.overallScore).find((score) => score !== null && score !== undefined);

  const query = analyticsQuerySchema.parse({ range: pickParam(params, 'range'), from: pickParam(params, 'from'), to: pickParam(params, 'to') });
  const analytics = analyticsView ? await getResumeAnalytics(query.range, query.from, query.to) : null;
  return { resumes, activeCount, latestScore, analytics };
}
