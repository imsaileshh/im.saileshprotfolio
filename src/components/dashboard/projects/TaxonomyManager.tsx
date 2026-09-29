'use client';

import { ConfirmSubmitButton } from '@/components/dashboard/ConfirmSubmitButton';
import { createProjectTaxonomyAction, deleteProjectTaxonomyAction, updateProjectTaxonomyAction } from '@/lib/dashboard/client-actions';
import { projectTaxonomyTypes } from '@/lib/dashboard/presentation';

type Taxonomy = {
  id: string;
  type: string;
  name: string;
  slug: string;
  description: string | null;
};

const inputClass = 'h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]';

export function TaxonomyManager({ taxonomies }: { taxonomies: Taxonomy[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-white">Categories, Technologies & Tags</h2>
        <p className="text-sm text-zinc-500">Create, edit and delete reusable taxonomy values for Projects filters and forms.</p>
      </div>

      <form action={createProjectTaxonomyAction} className="mt-4 grid gap-3 md:grid-cols-[150px_1fr_1fr_auto]">
        <select name="type" className={inputClass} defaultValue="category">
          {projectTaxonomyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <input name="name" className={inputClass} placeholder="Name" required minLength={2} />
        <input name="slug" className={inputClass} placeholder="Optional slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
        <button className="rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white">Add</button>
      </form>

      <div className="mt-5 grid gap-3">
        {taxonomies.length ? taxonomies.map((item) => (
          <form key={item.id} action={updateProjectTaxonomyAction} className="grid gap-2 rounded border border-white/10 p-3 md:grid-cols-[120px_1fr_1fr_auto_auto]">
            <input type="hidden" name="id" value={item.id} />
            <select name="type" className={inputClass} defaultValue={item.type}>
              {projectTaxonomyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <input name="name" className={inputClass} defaultValue={item.name} required minLength={2} />
            <input name="slug" className={inputClass} defaultValue={item.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
            <button className="rounded border border-white/10 px-3 text-sm text-zinc-200 hover:bg-white/10">Save</button>
            <ConfirmSubmitButton
              message={`Delete ${item.name}?`}
              className="rounded border border-red-500/30 px-3 text-sm text-red-200 hover:bg-red-500/10"
              form={`delete-taxonomy-${item.id}`}
              name="intent"
              value="delete"
            >
              Delete
            </ConfirmSubmitButton>
          </form>
        )) : (
          <p className="rounded border border-dashed border-white/10 p-4 text-sm text-zinc-500">No taxonomy records yet. Add categories like Web Development, UI/UX, Shopify, React, Next.js, Mobile, E-commerce, or Branding when you need them.</p>
        )}
      </div>

      {taxonomies.map((item) => (
        <form key={`${item.id}-delete`} id={`delete-taxonomy-${item.id}`} action={deleteProjectTaxonomyAction}>
          <input type="hidden" name="id" value={item.id} />
        </form>
      ))}
    </section>
  );
}
