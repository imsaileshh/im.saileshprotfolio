'use client';

export interface ThemePalette {
  background?: string;
  surface?: string;
  text?: string;
  mutedText?: string;
  accent?: string;
  border?: string;
  [key: string]: unknown;
}

export interface ColorPaletteProps {
  metadata?: {
    theme?: ThemePalette;
    [key: string]: unknown;
  } | null;
}

export function ColorPalette({ metadata }: ColorPaletteProps) {
  if (!metadata?.theme) return null;
  const theme = metadata.theme;

  const colors = [
    { label: 'Background', hex: theme.background },
    { label: 'Surface', hex: theme.surface },
    { label: 'Primary Text', hex: theme.text },
    { label: 'Muted Text', hex: theme.mutedText },
    { label: 'Accent / Brand', hex: theme.accent },
    { label: 'Border', hex: theme.border },
  ].filter(c => c.hex);

  return (
    <div className="space-y-8">
      {/* Large Gradient Panel */}
      {theme.accent && theme.background && (
        <div 
          className="h-48 w-full rounded-2xl border border-border-subtle"
          style={{ 
            background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.accent} 100%)` 
          }}
        />
      )}

      {/* Swatches Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {colors.map((color, idx) => (
          <div key={idx} className="group flex flex-col gap-3">
            <div 
              className="aspect-square w-full rounded-xl border border-border-subtle shadow-sm transition-transform group-hover:-translate-y-1"
              style={{ backgroundColor: color.hex }}
            />
            <div>
              <div className="text-xs font-semibold tracking-wider text-muted uppercase">{color.label}</div>
              <div className="mt-1 font-mono text-sm text-foreground uppercase">{color.hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
