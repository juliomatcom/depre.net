import fs from 'node:fs';
import path from 'node:path';
import { getPostSlugs } from '../src/lib/posts';
import { SITE_URL } from '../src/lib/site';

const OUT = path.join(process.cwd(), 'out');

/** Posts renamed after publishing: old slug -> new slug. */
const RENAMED_POSTS: [oldSlug: string, newSlug: string][] = [
  ['lensing-local-ai-feed-cleaner-2026-09-18', 'ufeed-feed-cleaner-browser-extension-2026-09-18'],
  ['feedlens-local-ai-feed-cleaner-2026-09-18', 'ufeed-feed-cleaner-browser-extension-2026-09-18'],
];

/** A minimal client-side redirect page for old, now-moved URLs. */
function stub(target: string): string {
  const abs = `${SITE_URL}${target}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${abs}">
<title>Moved</title>
</head>
<body>This page has moved to <a href="${target}">${target}</a>.</body>
</html>
`;
}

function write(relPath: string, target: string) {
  const dir = path.join(OUT, relPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), stub(target));
}

function main() {
  // Old post URLs carried the `.md` extension: /blog/<name>.md
  for (const slug of getPostSlugs()) {
    write(path.join('blog', `${slug}.md`), `/blog/${slug}/`);
  }
  // Old extensionless feed paths
  write(path.join('feed', 'rss'), '/feed/rss.xml');
  write(path.join('feed', 'atom'), '/feed/atom.xml');

  // Posts renamed after publishing keep their old URL working
  for (const [oldSlug, newSlug] of RENAMED_POSTS) {
    write(path.join('blog', oldSlug), `/blog/${newSlug}/`);
  }

  console.log('redirects: wrote legacy .md post + feed + renamed-post stubs');
}

main();
