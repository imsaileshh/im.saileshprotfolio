'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { messagePriorities } from '@/lib/dashboard/data';
import { requireAdmin } from '@/lib/dashboard/auth';

async function authorize() {
  const auth = await requireAdmin();
  if (!auth.authorized) throw new Error('Unauthorized');
}

function selectedIds(formData: FormData) {
  return formData.getAll('ids').map(String).filter(Boolean);
}

export async function bulkMessageAction(formData: FormData) {
  await authorize();
  const ids = selectedIds(formData);
  const action = String(formData.get('action') ?? '');

  if (!ids.length) return;

  if (action === 'delete') {
    await prisma.contactMessage.deleteMany({ where: { id: { in: ids } } });
  } else if (action === 'read') {
    await prisma.contactMessage.updateMany({ where: { id: { in: ids } }, data: { status: 'Read', isRead: true } });
  } else if (action === 'replied') {
    await prisma.contactMessage.updateMany({ where: { id: { in: ids } }, data: { status: 'Replied', isRead: true } });
  } else if (action === 'archive') {
    await prisma.contactMessage.updateMany({ where: { id: { in: ids } }, data: { status: 'Archived', isRead: true, isArchived: true } });
  } else if (action === 'restore') {
    await prisma.contactMessage.updateMany({ where: { id: { in: ids } }, data: { status: 'Read', isRead: true, isArchived: false } });
  }

  revalidatePath('/dashboard/messages');
}

export async function updateMessageStatusAction(formData: FormData) {
  await authorize();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');

  if (!id || !['New', 'Read', 'Replied', 'Archived'].includes(status)) return;

  await prisma.contactMessage.update({
    where: { id },
    data: {
      status: status as 'New' | 'Read' | 'Replied' | 'Archived',
      isRead: status !== 'New',
      isArchived: status === 'Archived',
    },
  });

  revalidatePath('/dashboard/messages');
  revalidatePath(`/dashboard/messages/${id}`);
}

export async function updateMessagePriorityAction(formData: FormData) {
  await authorize();
  const id = String(formData.get('id') ?? '');
  const priority = String(formData.get('priority') ?? '');

  if (!id || !messagePriorities.includes(priority as (typeof messagePriorities)[number])) return;

  await prisma.contactMessage.update({
    where: { id },
    data: { priority: priority as 'Low' | 'Normal' | 'High' | 'Urgent' },
  });

  revalidatePath('/dashboard/messages');
  revalidatePath(`/dashboard/messages/${id}`);
}

export async function deleteMessageAction(formData: FormData) {
  await authorize();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath('/dashboard/messages');
  redirect('/dashboard/messages');
}
