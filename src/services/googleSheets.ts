

'use server';

import { google } from 'googleapis';
import type { FeedbackOutput } from '@/ai/flows/feedback-flow';

/**
 * Appends a new row of processed feedback data to the configured Google Sheet.
 * This function requires GOOGLE_SHEETS_ID, GOOGLE_SHEETS_CLIENT_EMAIL, and
 * GOOGLE_SHEETS_PRIVATE_KEY to be set in the environment variables.
 *
 * @param feedbackData The structured feedback object to be added to the sheet.
 */
export async function appendToSheet(feedbackData: FeedbackOutput): Promise<void> {
  const { category, summary, sentiment, originalFeedback, ipAddress } = feedbackData;

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const client_email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  // The private key should be a multi-line string in the .env file, enclosed in double quotes.
  // It's read and used directly without modification.
  const private_key = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!spreadsheetId || !client_email || !private_key) {
    // Log a warning for developers but don't crash the app.
    // The feedback is still processed by the AI, it's just not saved to the sheet.
    console.warn('Google Sheets API credentials are not configured. Feedback will not be saved. Please set GOOGLE_SHEETS_ID, GOOGLE_SHEETS_CLIENT_EMAIL, and GOOGLE_SHEETS_PRIVATE_KEY in your .env file.');
    return; // Exit gracefully
  }

  try {
    // Authenticate with Google using the individual service account credential components.
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email,
        private_key,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare the row data in the correct order for the sheet.
    // New column order: Timestamp, IP Address, Category, Sentiment, Summary, Full Feedback, Full JSON
    const newRow = [
      new Date().toISOString(),
      ipAddress || 'N/A', // Add IP address
      category,
      sentiment,
      summary,
      originalFeedback,
      JSON.stringify(feedbackData, null, 2), // Full JSON for debugging/backup
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      // The range where new data will be appended. 'Sheet1' is the default name.
      range: 'Sheet1!A1',
      // How the input data should be interpreted.
      valueInputOption: 'USER_ENTERED',
      // The data to append.
      requestBody: {
        values: [newRow],
      },
    });
  } catch (error: any) {
    console.error('Error from Google Sheets API:', error);
    
    let userMessage = 'Failed to write to Google Sheet. Please check the server logs for details.';
    if (error.code === 403 || error.message?.includes('PERMISSION_DENIED')) {
        userMessage = "Permission denied. Please ensure your service account has 'Editor' access to the Google Sheet and that the Sheets API is enabled in your Google Cloud project.";
    } else if (error.code === 404) {
        userMessage = "Spreadsheet not found. Please verify the GOOGLE_SHEETS_ID in your environment variables is correct.";
    } else if (error.message?.includes('Unable to parse range')) {
        userMessage = "Invalid range. Please ensure the target sheet is named 'Sheet1' or update the range in the code.";
    } else if (error.message?.includes('invalid_grant')) {
        userMessage = "Invalid credentials. Please double-check the client email and private key in your .env file.";
    }

    // Do not throw the error to the client, just log it. This is an optional feature.
    console.error(`Google Sheets service error: ${userMessage}`);
  }
}
