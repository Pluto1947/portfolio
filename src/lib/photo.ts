import type { ImageMetadata } from 'astro';
import site from '../../content/_site.json';

// Dan's photo: a file in content/_files named by "photo" in _site.json.
// Imported this way so Astro resizes and compresses it for every place it's used.
const files = import.meta.glob<ImageMetadata>('../../content/_files/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, import: 'default' });

export function getPhoto(): ImageMetadata | null {
  const name = (site as { photo?: string }).photo;
  if (!name) return null;
  const hit = Object.entries(files).find(([p]) => p.endsWith(`/_files/${name}`));
  return hit ? hit[1] : null;
}
