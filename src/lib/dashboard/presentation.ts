export const contactStatuses = ['New', 'Read', 'Replied', 'Archived'] as const;
export const projectTaxonomyTypes = ['category', 'technology', 'tag'] as const;
export const conversionEventTypes = ['hire_click', 'resume_download', 'contact_submit'] as const;

export function pickParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  const item = Array.isArray(value) ? value[0] : value;
  return typeof item === 'string' && item.trim() === '' ? undefined : item;
}

export function formatShortId(value: string) {
  return value.slice(0, 8).toUpperCase();
}

export function getProjectStatus(project: { published: boolean; archived: boolean }) {
  if (project.archived) return 'Archived';
  if (project.published) return 'Published';
  return 'Draft';
}
