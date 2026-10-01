export type CaseStudyAvailabilityInput = {
  status?: string | null;
  sections?: unknown[] | null;
} | null | undefined;

/**
 * Checks whether a case study is genuinely published and available for public viewing.
 * Returns true if status is explicitly PUBLISHED (case-insensitive),
 * or if sections exist and status is not ARCHIVED or an empty draft.
 */
export function isCaseStudyAvailable(caseStudy: CaseStudyAvailabilityInput): boolean {
  if (!caseStudy) return false;
  const statusUpper = String(caseStudy.status || '').toUpperCase().trim();
  if (statusUpper === 'PUBLISHED') return true;
  if (
    statusUpper !== 'ARCHIVED' &&
    Array.isArray(caseStudy.sections) &&
    caseStudy.sections.length > 0
  ) {
    return true;
  }
  return false;
}
