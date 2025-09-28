// src/pages/robots.txt.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  // Get domain from environment variable with fallback
  const siteDomain = import.meta.env.PUBLIC_SITE_DOMAIN;
  const siteUrl = `https://${siteDomain}`;
  
  // Build your robots directives
  const lines = [
    'User-agent: *',
    'Allow: /',
    // Uncomment when you have a sitemap
    // `Sitemap: ${siteUrl}/sitemap-0.xml`,
    `Host: ${siteUrl}`,
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
};