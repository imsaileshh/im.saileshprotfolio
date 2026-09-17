'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';
import { prisma } from '@/lib/database/prisma';
import { persistResumeUpload } from '@/lib/resume/processing';
import { addResumeVersion, analyzeAndStoreResume, createResumeFromText, restoreResumeVersion } from '@/lib/resume/store';
import { jobDescriptionSchema } from '@/lib/validation/schemas';

async function requireDashboardAdmin() {
  const authSession = await verifySession();
  if (!authSession) redirect('/dashboard/login');
  if (authSession.user.role !== 'ADMIN') throw new Error('Unauthorized');
  return authSession;
}

export async function createTextResumeAction(formData: FormData) {
  await requireDashboardAdmin();

  const name = String(formData.get('name') ?? '').trim();
  const contentText = String(formData.get('contentText') ?? '').trim();
  if (contentText.length < 20) return;

  const created = await createResumeFromText({
    name: name || 'Resume',
    contentText,
    fileName: `${(name || 'resume').replace(/\s+/g, '-').toLowerCase()}.txt`,
  });

  revalidatePath('/dashboard/resume');
  redirect(`/dashboard/resume/${created.resume.id}`);
}

export async function uploadResumeAction(formData: FormData) {
  await requireDashboardAdmin();

  const file = formData.get('file');
  if (!(file instanceof File) || file.size <= 0) return;

  const name = String(formData.get('name') ?? '').trim() || file.name.replace(/\.[^.]+$/, '');
  const resume = await prisma.resume.create({
    data: {
      version: '0',
      name,
      fileUrl: '',
      fileName: file.name,
      fileType: file.type,
      isActive: true,
      status: 'Active',
    },
  });

  try {
    const saved = await persistResumeUpload(file, resume.id);
    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        fileUrl: saved.filePath,
        fileName: saved.fileName,
        fileType: saved.fileType,
        originalFilePath: saved.filePath,
        originalText: saved.text,
      },
    });
    await addResumeVersion({
      resumeId: resume.id,
      name,
      fileName: saved.fileName,
      fileType: saved.fileType,
      filePath: saved.filePath,
      contentText: saved.text,
      changeSummary: 'Uploaded resume file',
    });
  } catch (error) {
    await prisma.resume.delete({ where: { id: resume.id } }).catch(() => undefined);
    throw error;
  }

  revalidatePath('/dashboard/resume');
  redirect(`/dashboard/resume/${resume.id}`);
}

export async function saveResumeVersionAction(formData: FormData) {
  await requireDashboardAdmin();

  const resumeId = String(formData.get('resumeId') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const changeSummary = String(formData.get('changeSummary') ?? '').trim();
  const contentText = String(formData.get('contentText') ?? '').trim();

  if (!resumeId || contentText.length < 20) return;

  await addResumeVersion({
    resumeId,
    name: name || undefined,
    changeSummary: changeSummary || 'Edited resume content',
    contentText,
  });

  revalidatePath('/dashboard/resume');
  revalidatePath(`/dashboard/resume/${resumeId}`);
  redirect(`/dashboard/resume/${resumeId}`);
}

export async function restoreResumeVersionAction(formData: FormData) {
  await requireDashboardAdmin();

  const resumeId = String(formData.get('resumeId') ?? '');
  const versionId = String(formData.get('versionId') ?? '');
  if (!resumeId || !versionId) return;

  await restoreResumeVersion(resumeId, versionId);
  revalidatePath(`/dashboard/resume/${resumeId}`);
  revalidatePath(`/dashboard/resume/${resumeId}/versions`);
}

export async function archiveResumeAction(formData: FormData) {
  await requireDashboardAdmin();

  const resumeId = String(formData.get('resumeId') ?? '');
  if (!resumeId) return;

  await prisma.resume.update({ where: { id: resumeId }, data: { status: 'Archived', isActive: false } });
  revalidatePath('/dashboard/resume');
  redirect('/dashboard/resume');
}

export async function runAtsAnalysisAction(formData: FormData) {
  await requireDashboardAdmin();

  const resumeId = String(formData.get('resumeId') ?? '');
  const versionId = String(formData.get('versionId') ?? '') || undefined;
  const payload = jobDescriptionSchema.safeParse({
    title: formData.get('title'),
    company: formData.get('company') ? String(formData.get('company')) : undefined,
    industry: formData.get('industry') ? String(formData.get('industry')) : undefined,
    description: formData.get('description'),
  });

  if (!resumeId || !payload.success) return;

  await analyzeAndStoreResume({
    resumeId,
    versionId,
    jobDescription: payload.data,
  });

  revalidatePath(`/dashboard/resume/${resumeId}`);
  revalidatePath(`/dashboard/resume/${resumeId}/ats`);
  redirect(`/dashboard/resume/${resumeId}/ats`);
}

export async function getResumeAnalyticsAction(rangeKey: import('@/lib/dashboard/overview').DashboardRangeKey = 'last7') {
  await requireDashboardAdmin();
  const { getResumeAnalytics } = await import('@/lib/dashboard/data');
  const data = await getResumeAnalytics(rangeKey);
  return {
    ...data,
    range: {
      label: data.range.label,
      from: data.range.from.toISOString(),
      to: data.range.to.toISOString(),
    },
    recentEvents: data.recentEvents.map((e) => ({
      ...e,
      timestamp: e.timestamp.toISOString(),
    })),
  };
}
