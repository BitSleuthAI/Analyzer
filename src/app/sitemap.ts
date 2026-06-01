import { type MetadataRoute } from 'next'
 
// Stable timestamp so the sitemap doesn't appear "always new" to crawlers on
// every build/request. Bump when public page content changes meaningfully.
const LAST_MODIFIED = new Date('2026-06-01T00:00:00Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.bitsleuth.ai';

  const staticRoutes = [
    {
      url: `${siteUrl}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/market`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/mempool`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/discover`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // Add more public pages that can be indexed
    {
      url: `${siteUrl}/landing`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/feedback`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

  return staticRoutes;
}
