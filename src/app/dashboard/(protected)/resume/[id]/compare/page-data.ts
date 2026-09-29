import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { compareResumeVersions } from '@/lib/resume/store';
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};
function pick(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
export async function loadPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearch = (await searchParams) ?? {};
  const resume = await prisma.resume.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: 'desc' } } },
  });

  if (!resume || resume.status === 'Deleted') notFound();
  const defaultA = resume.versions[1]?.id ?? resume.versions[0]?.id ?? '';
  const defaultB = resume.versions[0]?.id ?? '';
  const versionAId = pick(resolvedSearch.versionAId) ?? defaultA;
  const versionBId = pick(resolvedSearch.versionBId) ?? defaultB;
  const comparison = versionAId && versionBId ? await compareResumeVersions(resume.id, versionAId, versionBId) : null;
  return { id, resume, versionAId, versionBId, comparison };
}
