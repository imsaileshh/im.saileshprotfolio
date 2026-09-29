'use client';

import { useEffect, useRef } from 'react';
import { CaseStudyContent, type CaseStudyContentData } from '@/components/case-study/CaseStudyContent';

export function CaseStudyEditorPreview({ caseStudy, onClose }: {
  caseStudy: CaseStudyContentData;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog ref={dialog} onCancel={onClose} aria-label="Unsaved case study preview"
      className="fixed inset-0 m-auto h-[92vh] w-[96vw] max-w-6xl rounded-2xl bg-background text-foreground p-0 backdrop:bg-black/80">
      <div className="sticky top-0 z-50 flex items-center justify-between bg-background border-b border-border-subtle p-4">
        <span>Preview · Current unsaved content</span>
        <button type="button" autoFocus onClick={onClose} className="rounded-lg border px-4 py-2">Close preview</button>
      </div>
      <div className="p-6 sm:p-10"><CaseStudyContent caseStudy={caseStudy} /></div>
    </dialog>
  );
}
