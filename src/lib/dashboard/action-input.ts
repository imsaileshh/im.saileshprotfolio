import { z } from 'zod';

const argumentsSchema = z.array(z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('json'), value: z.unknown().optional() }),
  z.object({ kind: z.literal('form'), entries: z.array(z.object({ name: z.string(), key: z.string().regex(/^\$field:\d+$/) })) }),
])).max(10);

export function decodeActionArguments(body: FormData): unknown[] {
  const args = argumentsSchema.parse(JSON.parse(String(body.get('$args') ?? '')));
  return args.map(arg => {
    if (arg.kind === 'json') return arg.value;
    const form = new FormData();
    for (const { name, key } of arg.entries) {
      const value = body.get(key);
      if (value === null) throw new Error('Missing form field');
      form.append(name, value);
    }
    return form;
  });
}
