import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import fs from 'node:fs';
import locations from '../content/_locations.json';
import services from '../content/_services.json';
import terminal from '../content/_terminal.json';
import site from '../content/_site.json';
import domainsFile from '../content/_domains.json';

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

// _terminal.json holds the site terminal's whoami text and any extra fixed commands.
const terminalSchema = z.object({
  whoami: z.string().min(1),
  commands: z.record(z.string().regex(/^[a-z0-9-]+$/, 'command names are lowercase letters, digits and hyphens'), z.string()).default({}),
});
const parsedTerminal = terminalSchema.safeParse(terminal);
if (!parsedTerminal.success) {
  throw new Error(`content/_terminal.json is invalid: ${parsedTerminal.error.message}`);
}

// _site.json holds the name and one line intro shown on the home page.
const siteSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  contactIntro: z.string().min(1),
  links: z.object({
    github: z.union([z.literal(''), z.string().url()]).default(''),
    linkedin: z.union([z.literal(''), z.string().url()]).default(''),
    email: z.union([z.literal(''), z.string().email()]).default(''),
  }).default({ github: '', linkedin: '', email: '' }),
  // a file name in content/_files, published at /files/<name>; empty hides the CV link
  cv: z.string().default(''),
  // an image in content/_files (jpg, png or webp); empty hides the photo everywhere
  photo: z.string().regex(/^$|\.(jpe?g|png|webp)$/i, 'photo must be a .jpg, .png or .webp file name').default(''),
});
const parsedSite = siteSchema.safeParse(site);
if (!parsedSite.success) {
  throw new Error(`content/_site.json is invalid: ${parsedSite.error.message}`);
}

// _domains.json: each domain's display name and accent colour, in nav order.
const domainSchema = z.record(
  z.string().regex(/^[a-z0-9-]+$/, 'domain slugs are lowercase letters, digits and hyphens (the folder name)'),
  z.object({ label: z.string().min(1), accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'accent must be a colour like #2DD4BF') }),
);
const parsedDomains = domainSchema.safeParse(domainsFile);
if (!parsedDomains.success) {
  throw new Error(`content/_domains.json is invalid: ${parsedDomains.error.message}`);
}
const sitePhoto = (site as { photo?: string }).photo;
if (sitePhoto && !fs.existsSync(new URL(`../content/_files/${sitePhoto}`, import.meta.url))) {
  throw new Error(`content/_site.json: photo "${sitePhoto}" was not found in content/_files/`);
}
if (site.cv && !fs.existsSync(new URL(`../content/_files/${site.cv}`, import.meta.url))) {
  throw new Error(`content/_site.json: cv "${site.cv}" was not found in content/_files/`);
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

// Standalone pages written in markdown (for now the About page): content/_pages/<name>.md
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/_pages' }),
  schema: z.object({ title: z.string().min(1), description: z.string().min(1) }),
});

export const collections = { content, pages };
