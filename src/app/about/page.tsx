import { prisma } from '@/lib/database/prisma';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutApproach } from '@/components/about/AboutApproach';
import { AboutCapabilities } from '@/components/about/AboutCapabilities';
import { AboutPhilosophy } from '@/components/about/AboutPhilosophy';
import { AboutValues } from '@/components/about/AboutValues';

export const revalidate = 30;

export default async function AboutPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' }
  });

  return (
    <div className="flex flex-col p-5 sm:p-6 md:p-10 lg:p-14 pb-10 max-w-6xl mx-auto w-full">
      <AboutHero data={settings?.aboutPageIntro as any} />
      <AboutApproach data={(settings?.aboutApproach as any) || undefined} />
      <AboutCapabilities data={(settings?.aboutBring as any) || undefined} />
      <AboutPhilosophy data={(settings?.aboutPhilosophy as any) || undefined} />
      <AboutValues data={(settings?.aboutValues as any) || undefined} />
    </div>
  );
}
