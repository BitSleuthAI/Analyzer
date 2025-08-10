
'use server';

import type { NewsArticle } from '@/lib/types';

// The base URL for the CryptoCompare news API.
const NEWS_API_URL = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC';

/**
 * Fetches the latest news articles about Bitcoin from the CryptoCompare API.
 * Requires a CRYPTOCOMPARE_API_KEY to be set in the environment variables.
 */
export async function getLatestBitcoinNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;

  if (!apiKey) {
    const errorSummary = "The news service is not working because the `CRYPTOCOMPARE_API_KEY` is missing from the server's environment configuration. The application developer must add this key to the `.env` file and restart the server.";
    console.warn(errorSummary);
    return [{
        title: 'News Service Misconfigured',
        summary: errorSummary,
        date: new Date().toISOString(),
    }];
  }

  console.log("Fetching real news data from CryptoCompare...");
  try {
    const response = await fetch(NEWS_API_URL, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Apikey ${apiKey}`
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`CryptoCompare API request failed with status: ${response.status}`);
      const errorBody = await response.text();
      console.error("Error body:", errorBody);
      
      let errorMessage = `The news service returned an error (status: ${response.status}).`;
      if (response.status === 401 || response.status === 403) {
        errorMessage = "The provided CryptoCompare API key is invalid or has insufficient permissions. Please verify the key and try again.";
      }

      return [{
          title: 'Error Fetching News',
          summary: `Could not retrieve the latest news at this time. ${errorMessage}`,
          date: new Date().toISOString(),
      }];
    }

    const newsData = await response.json();

    if (newsData.Type !== 100) { // CryptoCompare uses `Type: 100` for success
        console.error("CryptoCompare API returned a non-success response:", newsData.Message);
        return [{
            title: 'News API Error',
            summary: `The news API returned an error: ${newsData.Message}`,
            date: new Date().toISOString(),
        }];
    }

    if (!newsData.Data || newsData.Data.length === 0) {
        return [{
            title: "No Recent News",
            summary: "I couldn't find any recent Bitcoin news.",
            date: new Date().toISOString(),
        }];
    }

    return newsData.Data.slice(0, 5).map((article: any): NewsArticle => ({
      title: article.title,
      summary: article.body.length > 250 ? `${article.body.substring(0, 247)}...` : article.body,
      date: new Date(article.published_on * 1000).toISOString(),
    }));

  } catch (error) {
    console.error("Error fetching or parsing news data:", error);
    return [{
        title: 'Service Communication Error',
        summary: 'Failed to communicate with the news service. Please check your connection and try again.',
        date: new Date().toISOString(),
    }];
  }
}
