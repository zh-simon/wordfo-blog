import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/posts';
import { SITE_URL } from '../consts';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))];

  const staticPaths = ['/', '/blog/', '/tags/', '/about/'];
  const paths = [
    ...staticPaths.map((p) => ({ path: p, lastmod: null as string | null })),
    ...posts.map((post) => ({
      path: `/blog/${post.id}/`,
      lastmod: (post.data.updatedDate ?? post.data.pubDate).toISOString().slice(0, 10),
    })),
    ...tags.map((tag) => ({ path: `/tags/${encodeURIComponent(tag)}/`, lastmod: null as string | null })),
  ];

  const urls = paths
    .map(({ path, lastmod }) => {
      const loc = new URL(path, SITE_URL).href;
      return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
