// src/pages/robots.txt.ts
import { siteData } from '@/content/siteData';
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  // Get domain from environment variable with fallback
  
  // Build your robots directives
  const lines = [
    'User-agent: *',
    'Allow: /',
    // Uncomment when you have a sitemap
    // `Sitemap: ${siteUrl}/sitemap-0.xml`,
    `Host: ${siteData.url}`,
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
};