'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SpecializingInEditorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/home#specializing-in');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[40vh] text-zinc-500 text-sm">
      Redirecting to Specializing In editor…
    </div>
  );
}
