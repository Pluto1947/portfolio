import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import locations from '../content/_locations.json';
import services from '../content/_services.json';

// This schema IS the frontmatter validator. `astro build` (and CI) parse every
// content file against it and fail on missing/malformed fields — see AGENTS.md
// "Content schema". Keep it in sync with content/_template.md.

// _locations.json is validated here too, so a typo fails the build like bad frontmatter.
const locationSchema = z.record(
  z.string(),
  z.object({
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    label: z.string().min(1),
    since: z.string().regex(/^\d{4}(-\d{2})?$/, 'since must be YYYY or YYYY-MM').optional(),
  }).refine((l) => (l.lat === undefined) === (l.lng === undefined), 'lat and lng must be given together'),
);
const parsedLocations = locationSchema.safeParse(locations);
if (!parsedLocations.success) {
  throw new Error(`content/_locations.json is invalid: ${parsedLocations.error.message}`);
}

// _services.json drives the topic cards on the Contact page; validated the same way.
const serviceSchema = z.array(z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  badge: z.string().min(1).optional(),
  icon: z.enum(['shield', 'code', 'chat', 'cloud', 'brain', 'star']).optional(),
  accent: z.enum(['teal', 'violet', 'coral', 'web']).optional(),
})).nonempty();
const parsedServices = serviceSchema.safeParse(services);
if (!parsedServices.success) {
  throw new Error(`content/_services.json is invalid: ${parsedServices.error.message}`);
}

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
