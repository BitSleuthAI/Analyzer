import { type MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.bitsleuth.ai';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Only disallow pages that strictly require a connected wallet for their primary function.
      // Public-facing utility pages like /market, /mempool, /discover, and dynamic detail pages
      // are now crawlable.
      disallow: [
        '/dashboard/',
        '/analysis/',
        '/security/',
        '/chat/',
        '/feedback/',
        '/report/',
        '/coin-control/',
        '/transactions', // Disallow the generic transaction list page
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
