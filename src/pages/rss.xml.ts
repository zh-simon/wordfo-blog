import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/posts';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../consts';

const escapeXml = (text: string): string =>
  text.replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c] ?? c
  );

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${SITE_URL}/blog/${post.id}/</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.id}/</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(post.data.description)}</description>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
