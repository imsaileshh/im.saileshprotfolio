import { prisma } from '@/lib/database/prisma';
import { StackClient } from '@/components/stack/StackClient';
import { StackHero } from '@/components/stack/StackHero';

export const revalidate = 30;

export default async function StackPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
    select: { stackTitle: true, stackDescription: true }
  });

  const sections = await prisma.skillSection.findMany({
    where: { visible: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      skills: {
        where: { visible: true },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  return (
    <div className="flex flex-col p-5 sm:p-6 md:p-10 lg:p-14 pb-24 max-w-7xl mx-auto w-full relative">
      <StackHero title={settings?.stackTitle} description={settings?.stackDescription} sections={sections} />
      
      {sections.length > 0 ? (
        <StackClient sections={sections} />
      ) : (
        <p className="text-muted text-center mt-20">Stack technologies will appear here.</p>
      )}
    </div>
  );
}
