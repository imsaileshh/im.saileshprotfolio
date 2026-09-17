import path from 'node:path';
import { uploadPersistentFile } from '@/lib/storage/storage';

export const resumeMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

const maxResumeFileSize = 8 * 1024 * 1024;
const extractionFailureMessage = 'Unable to extract resume text. Please upload another file or enter your resume manually.';

type ResumeFileLike = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type ParsedResumeSection = {
  sectionType: string;
  title: string;
  content: string;
  orderIndex: number;
};

export function safeResumeFileName(fileName: string) {
  const cleaned = fileName
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180);
  return cleaned || 'resume-upload';
}

export function inferResumeMimeType(fileName: string, suppliedType?: string): string {
  if (resumeMimeTypes.includes(suppliedType as (typeof resumeMimeTypes)[number])) return suppliedType ?? '';
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return suppliedType ?? '';
}

export function validateResumeFile(file: Pick<ResumeFileLike, 'name' | 'type' | 'size'>) {
  const fileType = inferResumeMimeType(file.name, file.type);
  if (!resumeMimeTypes.includes(fileType as (typeof resumeMimeTypes)[number])) {
    return { ok: false as const, error: 'Only PDF and DOCX resume uploads are supported.' };
  }
  if (file.size <= 0) {
    return { ok: false as const, error: 'Resume file is empty.' };
  }
  if (file.size > maxResumeFileSize) {
    return { ok: false as const, error: 'Resume file must be 8 MB or smaller.' };
  }
  return { ok: true as const, fileType };
}

export async function extractResumeText(buffer: Buffer, mimeType: string) {
  if (mimeType === 'application/pdf') {
    const pdfModule = await import('pdf-parse');
    const PDFParse = (pdfModule as any).PDFParse;
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      const text = String(result.text ?? '').trim();
      if (text.length < 20) throw new Error('Extracted text is too short. Please upload a valid resume.');
      return text;
    } finally {
      await parser.destroy();
    }
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammothModule = await import('mammoth');
    const mammoth = mammothModule.default || mammothModule;
    const result = await mammoth.extractRawText({ buffer });
    const text = String(result.value ?? '').trim();
    if (text.length < 20) throw new Error('Extracted text is too short. Please upload a valid resume.');
    return text;
  }

  throw new Error('Unsupported file type for extraction.');
}

export async function persistResumeUpload(file: ResumeFileLike, resumeId: string) {
  const validation = validateResumeFile(file);
  if (!validation.ok) throw new Error(validation.error);

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${safeResumeFileName(file.name)}`;
  const uploaded = await uploadPersistentFile({
    buffer: bytes,
    fileName,
    contentType: validation.fileType,
    folder: 'resumes',
  });

  return {
    fileName,
    filePath: uploaded.url,
    fileType: validation.fileType,
    text: await extractResumeText(bytes, validation.fileType),
  };
}

const sectionAliases: Record<string, string> = {
  summary: 'summary',
  profile: 'summary',
  objective: 'summary',
  skills: 'skills',
  technologies: 'skills',
  tools: 'skills',
  experience: 'experience',
  employment: 'experience',
  projects: 'projects',
  portfolio: 'projects',
  education: 'education',
  certifications: 'certifications',
  certificates: 'certifications',
};

export function parseResumeSections(text: string): ParsedResumeSection[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const sections: ParsedResumeSection[] = [];
  let current: ParsedResumeSection | null = null;

  for (const line of lines) {
    const normalized = line.toLowerCase().replace(/[:\-]+$/g, '');
    const sectionType = sectionAliases[normalized];

    if (sectionType && line.length <= 40) {
      if (current && current.content.trim()) sections.push(current);
      current = {
        sectionType,
        title: line.replace(/[:\-]+$/g, ''),
        content: '',
        orderIndex: sections.length,
      };
      continue;
    }

    if (!current) {
      current = {
        sectionType: 'header',
        title: 'Header',
        content: '',
        orderIndex: sections.length,
      };
    }

    current.content = `${current.content}${current.content ? '\n' : ''}${line}`;
  }

  if (current && current.content.trim()) sections.push(current);
  return sections.length ? sections : [{ sectionType: 'resume', title: 'Resume', content: text, orderIndex: 0 }];
}

export function structuredDataFromSections(sections: ParsedResumeSection[]) {
  const byType = new Map(sections.map((section) => [section.sectionType, section.content]));
  const skillText = byType.get('skills') ?? '';
  const skillCandidates = skillText
    .split(/[,|•\n]/)
    .map((skill) => skill.trim())
    .filter((skill) => skill.length >= 2 && skill.length <= 40);

  return {
    summary: byType.get('summary'),
    skills: [...new Set(skillCandidates)].slice(0, 40),
    experience: sections.filter((section) => section.sectionType === 'experience').map((section) => section.content),
    projects: sections.filter((section) => section.sectionType === 'projects').map((section) => section.content),
    education: sections.filter((section) => section.sectionType === 'education').map((section) => section.content),
    certifications: sections.filter((section) => section.sectionType === 'certifications').map((section) => section.content),
  };
}
