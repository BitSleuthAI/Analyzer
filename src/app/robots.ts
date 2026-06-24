import { type MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.bitsleuth.ai';
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/landing',
          '/market',
          '/mempool',
          '/discover',
          '/feedback',
        ],
        disallow: [
          '/dashboard/',
          '/analysis/',
          '/security/',
          '/chat/',
          '/report/',
          '/coin-control/',
          // Dynamic explorer pages form an effectively infinite crawl trap
          // (tx -> address -> tx -> ...) with negligible SEO value and run
          // uncached server functions on every hit. Keep crawlers out.
          '/transactions', // Covers the list page and all /transactions/* details
          '/address/',
          '/block/',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/landing',
          '/market',
          '/mempool',
          '/discover',
          '/feedback',
        ],
        disallow: [
          '/dashboard/',
          '/analysis/',
          '/security/',
          '/chat/',
          '/report/',
          '/coin-control/',
          '/transactions',
          '/address/',
          '/block/',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
