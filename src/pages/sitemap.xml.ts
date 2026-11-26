import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/posts';
import { getCollection } from 'astro:content';
import { SITE_URL } from '../consts';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const pages = await getCollection('pages');
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))];
  const categories = [...new Set(posts.map((post) => post.data.category))];

  const paths = [
    ...['/', '/blog/', '/categories/', '/tags/'].map((path) => ({ path, lastmod: null as string | null })),
    ...pages.map((page) => ({ path: `/${page.id}/`, lastmod: null as string | null })),
    ...posts.map((post) => ({
      path: `/blog/${post.id}/`,
      lastmod: (post.data.updatedDate ?? post.data.pubDate).toISOString().slice(0, 10),
    })),
    ...tags.map((tag) => ({ path: `/tags/${encodeURIComponent(tag)}/`, lastmod: null as string | null })),
    ...categories.map((category) => ({ path: `/categories/${encodeURIComponent(category)}/`, lastmod: null as string | null })),
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
