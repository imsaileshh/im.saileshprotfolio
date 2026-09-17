import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { prisma } from '@/lib/database/prisma';
import { SectionReveal, StaggerContainer, StaggerItem } from '@/components/ui/SectionReveal';
import { WORK_WHERE_CLAUSE } from '@/lib/constants/project-types';

export const metadata = {
  title: 'Projects | Sailesh P',
  description: 'A collection of selected works and technical projects.',
};

export const revalidate = 30;

export default async function ProjectsPage() {
  // WORKS ONLY — Personal Projects must never appear here
  const projects = await prisma.project.findMany({
    where: {
      published: true,
      archived: false,
      ...WORK_WHERE_CLAUSE,
    },
    include: { images: { orderBy: { order: 'asc' } } },
    orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }],
  });

  const categories = [
    'All',
    ...Array.from(
      new Set(projects.map((project) => project.category ?? project.technologies[0]).filter(Boolean)),
    ),
  ];

  return (
    <div className="flex flex-col p-5 sm:p-6 md:p-10 lg:p-14 pb-20">
      <SectionReveal className="mb-8 md:mb-10 border-b border-border-subtle pb-6">
        <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-4">
          Projects
        </h1>
        <p className="text-lg text-muted max-w-2xl">
          Experiments, tools and products I've built while exploring ideas and technologies.
        </p>
      </SectionReveal>

      {/* Optional Filters */}
      <SectionReveal className="flex flex-wrap gap-2 mb-8 md:mb-10">
        {categories.map((cat, idx) => (
          <button 
            key={idx}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              idx === 0 
                ? 'bg-foreground text-[var(--bg)]' 
                : 'border border-border-subtle text-muted hover:text-foreground hover:bg-border-subtle/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </SectionReveal>

      <div className="flex flex-col gap-16 md:gap-24 lg:gap-32">
        {projects.map((project, idx) => {
          const coverUrl = project.images.find((image) => image.isCover)?.url ?? project.images[0]?.url ?? project.coverImageUrl ?? `/images/projects/project${(idx % 4) + 1}.svg`;
          const category = project.category ?? project.technologies[0] ?? 'Project';
          const year = project.year ?? project.createdAt.getFullYear().toString();

          return (
            <SectionReveal key={project.id || idx}>
              <Link href={`/works/${project.slug}`} className="group flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-16 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-3xl">
                
                {/* Left Side: Image */}
                <div className="w-full md:w-3/5 lg:w-[60%] shrink-0">
                  <div className="relative w-full aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                    <Image 
                      src={coverUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-2/5 lg:w-[40%] flex flex-col justify-center py-4 md:py-0">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-muted uppercase tracking-[0.2em] mb-4">
                    <span>{year}</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-accent/60"></span>
                    <span>{category}</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl lg:text-[40px] font-display font-medium text-foreground tracking-tight leading-[1.1] mb-5 group-hover:text-accent transition-colors duration-300">
                    {project.title}
                  </h2>
                  
                  <p className="text-[15px] md:text-base text-muted leading-relaxed mb-8 max-w-lg">
                    {project.description}
                  </p>

                  <div className="mb-10">
                    <h3 className="text-[10px] font-mono font-medium tracking-[0.2em] text-muted/60 uppercase mb-3">
                      Development Tools
                    </h3>
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {project.technologies.slice(0, 5).map((tech: string, i: number, arr: string[]) => (
                        <span key={i} className="text-[13px] text-muted group-hover:text-foreground/80 transition-colors duration-300">
                          {tech}{i < arr.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground group-hover:text-accent transition-colors duration-300 w-fit">
                    View Project 
                    <ArrowUpRight size={18} className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            </SectionReveal>
          );
        })}
      </div>
    </div>
  );
}
