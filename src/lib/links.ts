import site from '../../content/_site.json';

// Contact and profile links from content/_site.json, in display order.
// Anything left empty in that file is simply not shown.
export interface SiteLink { key: 'github' | 'linkedin' | 'email' | 'cv'; label: string; href: string; external: boolean }

export function siteLinks(): SiteLink[] {
  const l = (site as { links?: Record<string, string> }).links ?? {};
  const cv = (site as { cv?: string }).cv ?? '';
  const out: SiteLink[] = [];
  if (l.github) out.push({ key: 'github', label: 'GitHub', href: l.github, external: true });
  if (l.linkedin) out.push({ key: 'linkedin', label: 'LinkedIn', href: l.linkedin, external: true });
  if (l.email) out.push({ key: 'email', label: 'Email', href: `mailto:${l.email}`, external: false });
  if (cv) out.push({ key: 'cv', label: 'CV', href: `/files/${cv}`, external: false });
  return out;
}
