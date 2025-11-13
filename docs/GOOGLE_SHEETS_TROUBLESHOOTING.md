# Google Sheets Feedback Integration Troubleshooting

## Overview
The feedback submission feature in BitSleuth uses Google Sheets API v4 to optionally save user feedback to a Google Sheet. The integration is designed to fail gracefully - if Google Sheets credentials are not configured or if there's an error, the feedback will still be processed by AI and shown to the user.

## Current Implementation Status
✅ **Working Correctly** - The code is properly configured for googleapis v140.0.1 with Sheets API v4.

### Technical Details
- **googleapis version**: 140.0.1
- **API version**: Sheets API v4
- **Files**:
  - `src/services/googleSheets.ts` - Google Sheets integration
  - `src/ai/flows/feedback-flow.ts` - Feedback processing flow
  - `src/app/(app)/feedback/page.tsx` - Feedback form UI

## Required Environment Variables

```env
# Google Sheets configuration (optional)
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

### Getting These Values

1. **GOOGLE_SHEETS_ID**: 
   - From your Google Sheet URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

2. **GOOGLE_SHEETS_CLIENT_EMAIL & GOOGLE_SHEETS_PRIVATE_KEY**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or select a project
   - Enable the Google Sheets API
   - Create a Service Account
   - Create and download a JSON key
   - The JSON contains `client_email` and `private_key`

3. **Share the Google Sheet**:
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (`GOOGLE_SHEETS_CLIENT_EMAIL`) as an Editor

## Expected Sheet Format

The code appends rows with the following columns:
1. **Timestamp** (ISO 8601)
2. **IP Address** (from x-forwarded-for header)
3. **Category** (Bug Report, Feature Request, UI/UX Feedback, General Praise, Other)
4. **Sentiment** (Positive, Negative, Neutral)
5. **Summary** (AI-generated one-sentence summary)
6. **Full Feedback** (original feedback text)
7. **Full JSON** (complete feedback object for debugging)

### Recommended Sheet Setup
Create a sheet named `Sheet1` with headers:
```
Timestamp | IP Address | Category | Sentiment | Summary | Full Feedback | Full JSON
```

## Troubleshooting Common Issues

### Issue: "Google Sheets API credentials are not configured"
**Cause**: Environment variables are missing or not loaded.

**Solution**:
1. Verify `.env.local` or `.env` file exists in the project root
2. Check that all three variables are set: `GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_CLIENT_EMAIL`, `GOOGLE_SHEETS_PRIVATE_KEY`
3. Restart the Next.js dev server after changing environment variables
4. For production, ensure environment variables are set in your deployment platform (Vercel, etc.)

### Issue: "Permission denied"
**Cause**: Service account doesn't have access to the Google Sheet.

**Solution**:
1. Open the Google Sheet
2. Click "Share" → Add the service account email as Editor
3. Verify the Sheets API is enabled in Google Cloud Console

### Issue: "Spreadsheet not found"
**Cause**: Incorrect spreadsheet ID.

**Solution**:
1. Double-check the `GOOGLE_SHEETS_ID` in your environment variables
2. Ensure the spreadsheet exists and is accessible
3. Verify the ID matches the URL of your sheet

### Issue: "Invalid credentials" / "invalid_grant"
**Cause**: Malformed private key.

**Solution**:
1. Ensure the private key in `.env` is enclosed in double quotes
2. Verify newlines are escaped as `\n` (the code will convert them)
3. Check that the entire key is present, including BEGIN/END markers
4. Example format:
   ```
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
   ```

### Issue: "Unable to parse range"
**Cause**: The sheet name doesn't match.

**Solution**:
1. Ensure your sheet is named `Sheet1` (default)
2. Or update the code in `src/services/googleSheets.ts` line 58 to match your sheet name

## Code Verification

### TypeScript Compilation
```bash
npm run typecheck
```
Should pass without errors related to googleapis or googleSheets.

### Build
```bash
npm run build
```
Should complete successfully.

### API v4 Parameter Structure (Correct)
```typescript
await sheets.spreadsheets.values.append({
  spreadsheetId,              // ✅ Top-level parameter
  range: 'Sheet1!A1',         // ✅ A1 notation
  valueInputOption: 'USER_ENTERED', // ✅ Top-level (v4 API)
  requestBody: {              // ✅ Contains ValueRange schema
    values: [newRow],         // ✅ 2D array of values
  },
});
```

## Testing Feedback Submission

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/feedback

3. Submit feedback

4. Check server console for logs:
   - Success: No error messages
   - Warning: "Google Sheets API credentials are not configured" (if not set up)
   - Error: Detailed error message with troubleshooting hints

5. Verify in Google Sheet (if configured)

## API v3 vs v4 Differences

If you see references to "v3 typescript" in error messages, note:
- BitSleuth uses **googleapis v140.0.1** which includes Sheets API v4
- The v4 API has `valueInputOption` as a top-level parameter (not inside requestBody)
- The v4 API uses `requestBody: { values: [...] }` structure
- There is no v3 API in the current googleapis package

## Graceful Degradation

The feedback system is designed to work WITHOUT Google Sheets:
- If credentials are missing: Logs warning, feedback still processed by AI
- If API call fails: Logs error, feedback still shown to user
- User experience is never blocked by Google Sheets failures

This is intentional - Google Sheets is an **optional** export feature.

## For Developers

### When to Update This Integration

Update required if:
- googleapis package is upgraded to a breaking version
- Google Sheets API v4 has breaking changes
- New feedback fields need to be added to the sheet

### Testing Changes

1. Create a test Google Sheet
2. Set up test service account credentials
3. Submit test feedback
4. Verify data appears in sheet with correct formatting
5. Test error cases (wrong credentials, missing sheet, etc.)
6. Ensure graceful degradation works (remove credentials, verify feedback still works)

## Additional Resources

- [Google Sheets API v4 Documentation](https://developers.google.com/sheets/api/reference/rest)
- [googleapis Node.js Client Documentation](https://github.com/googleapis/google-api-nodejs-client)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
