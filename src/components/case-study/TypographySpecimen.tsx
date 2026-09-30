'use client';

export interface TypographyData {
  headingStyle?: string;
  bodyStyle?: string;
  hierarchy?: string;
}

export interface TypographySpecimenProps {
  metadata?: {
    typography?: TypographyData;
    [key: string]: unknown;
  } | null;
}

export function TypographySpecimen({ metadata }: TypographySpecimenProps) {
  if (!metadata?.typography) return null;
  const typography = metadata.typography;

  const headingFont = typography.headingStyle || 'Sans-Serif';
  const bodyFont = typography.bodyStyle || 'Sans-Serif';

  return (
    <div className="space-y-16">
      {/* Headings Specimen */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xs font-bold tracking-widest text-muted uppercase">Heading Typography</h3>
          <div className="mb-6 text-4xl font-light text-foreground">{headingFont}</div>
          <div className="overflow-hidden break-words text-2xl leading-relaxed text-muted sm:text-3xl">
            A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
            <br />
            a b c d e f g h i j k l m n o p q r s t u v w x y z
            <br />
            0 1 2 3 4 5 6 7 8 9 ! @ # $ % & *
          </div>
        </div>
        
        <div className="flex flex-col justify-center space-y-6 rounded-2xl border border-border-subtle bg-[var(--card)] p-8 shadow-sm">
          <div>
            <div className="text-xs text-muted mb-1">H1 / Bold / 48px</div>
            <div className="text-4xl font-bold text-foreground">The quick brown fox</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">H2 / Semibold / 32px</div>
            <div className="text-3xl font-semibold text-foreground">The quick brown fox jumps</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">H3 / Medium / 24px</div>
            <div className="text-xl font-medium text-foreground">The quick brown fox jumps over</div>
          </div>
        </div>
      </div>

      {/* Body Specimen */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xs font-bold tracking-widest text-muted uppercase">Body Typography</h3>
          <div className="mb-6 text-4xl font-light text-foreground">{bodyFont}</div>
          <div className="overflow-hidden break-words text-2xl leading-relaxed text-muted sm:text-3xl">
            A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
            <br />
            a b c d e f g h i j k l m n o p q r s t u v w x y z
            <br />
            0 1 2 3 4 5 6 7 8 9 ! @ # $ % & *
          </div>
        </div>
        
        <div className="flex flex-col justify-center space-y-6 rounded-2xl border border-border-subtle bg-[var(--card)] p-8 shadow-sm">
          <div>
            <div className="text-xs text-muted mb-1">Body / Regular / 16px</div>
            <p className="text-base leading-relaxed text-foreground/90">
              The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.
            </p>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Caption / Medium / 14px</div>
            <p className="text-sm font-medium text-muted">
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>
      </div>

      {/* Hierarchy Notes */}
      {typography.hierarchy && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
          <h4 className="mb-2 text-sm font-semibold tracking-wide text-amber-600 dark:text-amber-400 uppercase">Hierarchy Rationale</h4>
          <p className="text-sm leading-relaxed text-foreground/90">{typography.hierarchy}</p>
        </div>
      )}
    </div>
  );
}
