import Link from 'next/link';
import { FilePlus2, Gauge, Layers3, Upload } from 'lucide-react';
import { prisma } from '@/lib/database/prisma';
import { getResumeAnalytics, pickParam } from '@/lib/dashboard/data';
import { analyticsQuerySchema } from '@/lib/validation/schemas';
import { ResumeAnalyticsPanel } from '@/components/dashboard/ResumeAnalyticsPanel';

export const dynamic = 'force-dynamic';

function statusTone(status: string) {
  if (status === 'Active') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  if (status === 'Archived') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
  return 'border-amber-400/30 bg-amber-400/10 text-amber-200';
}

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function DashboardResumePage({ searchParams }: PageProps) {
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

  if (analyticsView) {
    const query = analyticsQuerySchema.parse({ range: pickParam(params, 'range'), from: pickParam(params, 'from'), to: pickParam(params, 'to') });
    const analytics = await getResumeAnalytics(query.range, query.from, query.to);
    return <main className="space-y-6"><header className="flex flex-col gap-2"><h1 className="text-2xl font-bold tracking-tight">Resume Analytics</h1><p className="text-sm text-zinc-400">Real resume views and downloads from anonymous portfolio sessions.</p></header><ResumeAnalyticsPanel analytics={analytics} /></main>;
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume CMS</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage resume files, edited versions, and ATS analysis from real stored content.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/resume/templates" className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-zinc-200 hover:bg-white/10">
            <Layers3 size={16} /> Templates
          </Link>
          <Link href="/dashboard/resume/upload" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white hover:bg-[#3d78e5]">
            <Upload size={16} /> Add resume
          </Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-[#111113] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Stored resumes</p>
          <p className="mt-2 text-2xl font-semibold text-white">{resumes.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#111113] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Active resumes</p>
          <p className="mt-2 text-2xl font-semibold text-white">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#111113] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Latest ATS score</p>
          <p className="mt-2 text-2xl font-semibold text-white">{latestScore ?? 'No analysis'}</p>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-[#111113]">
        {resumes.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Resume</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">ATS</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {resumes.map((resume) => (
                  <tr key={resume.id} className="text-zinc-300">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{resume.name ?? resume.fileName}</p>
                      <p className="text-xs text-zinc-500">{resume.fileName}</p>
                    </td>
                    <td className="px-4 py-3">v{resume.versions[0]?.versionNumber ?? resume.version}</td>
                    <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs ${statusTone(resume.status)}`}>{resume.status}</span></td>
                    <td className="px-4 py-3">
                      {resume.analyses[0]?.overallScore !== null && resume.analyses[0]?.overallScore !== undefined ? `${resume.analyses[0].overallScore}/100` : 'Not run'}
                    </td>
                    <td className="px-4 py-3">{resume.updatedAt.toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/dashboard/resume/${resume.id}`} className="rounded border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10">Open</Link>
                        <Link href={`/dashboard/resume/${resume.id}/ats`} className="inline-flex items-center gap-1 rounded border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10"><Gauge size={13} /> ATS</Link>
                        <Link href={`/dashboard/resume/${resume.id}/edit`} className="rounded border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10">Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
            <FilePlus2 className="h-10 w-10 text-zinc-500" />
            <div>
              <p className="font-medium text-white">No resume uploaded yet.</p>
              <p className="mt-1 text-sm text-zinc-500">Upload a PDF/DOCX or paste resume text to begin.</p>
            </div>
            <Link href="/dashboard/resume/upload" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white hover:bg-[#3d78e5]">
              <Upload size={16} /> Add first resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
