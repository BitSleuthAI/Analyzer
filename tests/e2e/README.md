# E2E Tests for BitSleuth Analyzer

This directory contains end-to-end tests using Playwright.

## Running the Tests

### Prerequisites
- Node.js 20+ installed
- All dependencies installed (`npm install`)

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests interactively
```bash
npm run test:e2e:debug
```

### Run with a specific TEST_XPUB
```bash
TEST_XPUB="your_xpub_here" npm run test:e2e
```

## Login Flow Test

The `login-flow.spec.ts` test verifies:

1. **Successful connection**: User can connect a wallet with an XPUB and navigate to dashboard
2. **No stuck state**: The app doesn't get stuck on the connect page
3. **Fast cached connection**: Reconnecting with cached data is faster
4. **Performance benchmarks**:
   - Initial connection: < 60 seconds
   - Cached connection: < 20 seconds
   - Ideal threshold: < 30 seconds

## Screenshots

Screenshots are automatically saved to `tests/e2e/screenshots/` when tests run:
- `dashboard-after-connect.png` - Dashboard after first connection
- `dashboard-cached-connect.png` - Dashboard after cached connection

## Debugging Login Flow

To see detailed timing logs during login:

1. Set the environment variable:
   ```bash
   NEXT_PUBLIC_DEBUG_LOGIN_FLOW=true npm run dev
   ```

2. Run the E2E test or manually test in browser

3. Check the browser console for detailed timing logs showing:
   - connectStart
   - validationStart
   - addXpubStart/Complete
   - activeXpubDetected
   - navigationTriggered
   - dashboardMounted

## Troubleshooting

### Test timeouts
If tests timeout, increase the timeout in the test file or check:
- Network connectivity
- Blockchain API availability
- Server is running on http://localhost:3000

### Playwright not installed
Run: `npx playwright install chromium`

### Server not starting
Make sure port 3000 is available and Next.js dev server can start
