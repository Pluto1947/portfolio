import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import locations from '../content/_locations.json';

// This schema IS the frontmatter validator. `astro build` (and CI) parse every
// content file against it and fail on missing/malformed fields — see AGENTS.md
// "Content schema". Keep it in sync with content/_template.md.

const locationSlugs = Object.keys(locations);

const content = defineCollection({
  // <domain>/<slug>/index.md — the leading */* skips root files like _template.md.
  loader: glob({ pattern: '*/*/index.{md,mdx}', base: './content' }),
  schema: z.object({
    title: z.string().min(1),
    type: z.enum(['writeup', 'project', 'note', 'theory']),
    // Free-form on purpose: a new domain is a new folder, no code change (AGENTS.md).
    domains: z.array(z.string().min(1)).nonempty(),
    location: z
      .string()
      .default('remote')
      .refine((s) => locationSlugs.includes(s), {
        message: `location must be a slug defined in content/_locations.json (${locationSlugs.join(', ')})`,
      }),
    related: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    summary: z.string().min(1),
  }),
});

export const collections = { content };
