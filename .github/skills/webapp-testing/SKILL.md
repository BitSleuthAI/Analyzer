# Web Application Testing Skill

## Overview

This skill covers testing practices for the BitSleuth Analyzer web application. BitSleuth is an AI-powered Bitcoin wallet analyzer built with Next.js 15, React 18, and TypeScript. The testing strategy focuses on unit testing for business logic, performance testing for blockchain operations, and validation of core wallet functionality.

## Testing Philosophy

BitSleuth's testing approach emphasizes:

1. **Unit Testing**: Core business logic, utilities, and data processing functions
2. **Performance Testing**: Blockchain operations, address discovery, and wallet loading
3. **Type Safety**: Strict TypeScript checking as a first line of defense
4. **Manual Testing**: UI/UX validation and AI feature verification (due to external dependencies)

Given the nature of blockchain interactions, AI integrations, and real-time data fetching from external APIs, the project currently focuses on unit and performance testing rather than comprehensive end-to-end testing.

## Testing Stack

### Primary Tools
- **Vitest** - Fast unit test framework (Vite-powered alternative to Jest)
- **TypeScript** - Strict type checking (`tsc --noEmit`)
- **ESLint** - Code quality and consistency (`next lint`)

### Test Runner
```bash
npm test              # Run all unit tests with Vitest
npm run typecheck     # TypeScript type validation
npm run lint          # ESLint code quality checks
```

## Test Structure

### Test Organization

```
tests/
├── address-discovery-unit.test.ts      # Address discovery optimization validation
├── wallet-snapshot-cache.test.ts       # Cache system unit tests
├── tax-calculations.test.ts            # Tax classification logic
├── validate-initial-check-limit.test.ts # Performance threshold validation
├── test-xpub-performance.ts            # Real XPUB performance benchmarks
├── test-login-performance.ts           # Login flow performance tests
├── run-multiple-performance-tests.ts   # Consistency validation
└── compare-initial-check-limits.ts     # Performance comparison utilities
```

### Test Categories

#### 1. Unit Tests
Tests for pure business logic, data transformations, and utility functions.

**Examples:**
- `wallet-snapshot-cache.test.ts` - Cache operations, TTL management, deduplication
- `tax-calculations.test.ts` - Transaction classification, taxable event detection
- `address-discovery-unit.test.ts` - Address type inference, constant validation

**Pattern:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should perform expected behavior', () => {
    // Arrange
    const input = createTestData();
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

#### 2. Performance Tests
Real-world performance validation with actual XPUBs (configured via environment variables).

**Examples:**
- `test-xpub-performance.ts` - Full wallet data fetch performance
- `test-login-performance.ts` - Login flow timing benchmarks
- `validate-initial-check-limit.test.ts` - Address discovery threshold validation

**Pattern:**
```typescript
// Performance test with environment-based XPUB
const XPUB = process.env.TEST_XPUB;

if (!XPUB) {
  console.error('TEST_XPUB environment variable required');
  process.exit(1);
}

async function testPerformance() {
  const startTime = Date.now();
  const result = await performOperation(XPUB);
  const duration = Date.now() - startTime;
  
  console.log(`⏱️  Duration: ${duration}ms`);
  
  // Assert performance threshold
  if (duration > PERFORMANCE_THRESHOLD) {
    console.error('❌ Performance threshold exceeded');
    process.exit(1);
  }
}
```

## Writing Tests

### Unit Test Best Practices

#### 1. Test File Naming
- Use `.test.ts` suffix for unit tests
- Match the source file name (e.g., `wallet-snapshot-cache.ts` → `wallet-snapshot-cache.test.ts`)
- Place tests in `/tests` directory (not co-located)

#### 2. Test Structure
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { functionToTest } from '../src/lib/module';

describe('Module Name', () => {
  // Setup/teardown
  beforeEach(() => {
    // Reset state, clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup if needed
    vi.useRealTimers();
  });

  describe('Specific Feature', () => {
    it('describes the expected behavior', () => {
      // Test implementation
      const result = functionToTest(input);
      expect(result).toBe(expected);
    });

    it('handles edge cases correctly', () => {
      // Edge case validation
    });

    it('throws appropriate errors for invalid input', () => {
      expect(() => functionToTest(invalidInput)).toThrow();
    });
  });
});
```

#### 3. Mock External Dependencies
```typescript
import { vi } from 'vitest';

// Mock time-dependent logic
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01'));

// Mock async operations
const mockFetch = vi.fn().mockResolvedValue({ data: 'mock' });

// Restore after test
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
```

#### 4. Test Coverage Focus Areas

**Critical Business Logic:**
- Wallet data processing (`src/lib/blockchain.ts`)
- Transaction classification (`src/lib/tax-calculations.ts`)
- Cache management (`src/lib/wallet-snapshot-cache.ts`)
- UTXO calculations (`src/lib/types.ts`)
- Address derivation and discovery

**Utility Functions:**
- Data transformations (`src/lib/utils.ts`)
- Cache utilities (`src/lib/cache-utils.ts`)
- Fee calculations
- Security scoring

**Type Definitions:**
- Validate TypeScript types are correctly defined
- Ensure type safety in data transformations

### Performance Test Guidelines

#### 1. Environment Configuration
```bash
# Set test XPUB via environment variable
export TEST_XPUB="xpub..."

# Or use in CI/CD (GitHub Actions)
# Set TEST_XPUB in repository secrets/variables
```

#### 2. Performance Metrics to Track
- **Initial Load Time**: Time to fetch and process wallet data (target: <60s)
- **Currency Switch**: Time to recalculate with different currency (<1s with cache)
- **Wallet Switch**: Time to switch between cached wallets (<1s)
- **API Call Count**: Number of blockchain API requests (minimized via batching)
- **Cache Hit Rate**: Percentage of requests served from cache

#### 3. Performance Test Pattern
```typescript
interface PerformanceMetrics {
  totalDuration: number;
  apiCalls: number;
  addressesDiscovered: number;
  transactionCount: number;
  cacheHitRate?: number;
}

async function measurePerformance(): Promise<PerformanceMetrics> {
  const startTime = Date.now();
  let apiCallCount = 0;

  // Instrument API calls (if possible)
  const originalFetch = global.fetch;
  global.fetch = (...args) => {
    apiCallCount++;
    return originalFetch(...args);
  };

  const result = await operationUnderTest();

  global.fetch = originalFetch;

  return {
    totalDuration: Date.now() - startTime,
    apiCalls: apiCallCount,
    addressesDiscovered: result.addresses.length,
    transactionCount: result.transactions.length,
  };
}
```

## Running Tests

### Local Development

```bash
# Run all unit tests
npm test

# Run tests in watch mode (during development)
npm test -- --watch

# Run specific test file
npm test wallet-snapshot-cache.test.ts

# Run tests with coverage
npm test -- --coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Performance Testing

```bash
# Set test XPUB
export TEST_XPUB="your_test_xpub_here"

# Run XPUB performance test
npx tsx tests/test-xpub-performance.ts

# Run login performance test
npx tsx tests/test-login-performance.ts

# Run multiple iterations for consistency
npx tsx tests/run-multiple-performance-tests.ts

# Compare performance across different configurations
npx tsx tests/compare-initial-check-limits.ts
```

### CI/CD Integration

Tests run automatically in GitHub Actions workflows:

```yaml
# Example workflow step
- name: Run tests
  run: npm test

- name: Type check
  run: npm run typecheck

- name: Lint
  run: npm run lint

- name: Performance test
  env:
    TEST_XPUB: ${{ secrets.TEST_XPUB }}
  run: npx tsx tests/test-login-performance.ts
```

## Testing Key Features

### 1. Wallet Snapshot Cache

**Location:** `src/lib/wallet-snapshot-cache.ts`  
**Test:** `tests/wallet-snapshot-cache.test.ts`

**What to Test:**
- Cache storage and retrieval
- TTL expiration (5-minute default)
- In-flight request deduplication
- Cache invalidation
- Concurrent access handling

**Example:**
```typescript
it('should deduplicate concurrent requests', async () => {
  const fetchFn = vi.fn().mockResolvedValue(mockData);
  
  // Multiple simultaneous requests
  const [result1, result2, result3] = await Promise.all([
    withInFlightDeduplication('key', fetchFn),
    withInFlightDeduplication('key', fetchFn),
    withInFlightDeduplication('key', fetchFn),
  ]);

  // Should only call fetch once
  expect(fetchFn).toHaveBeenCalledTimes(1);
  expect(result1).toBe(result2);
  expect(result2).toBe(result3);
});
```

### 2. Tax Calculations

**Location:** `src/lib/tax-calculations.ts`  
**Test:** `tests/tax-calculations.test.ts`

**What to Test:**
- Transaction classification (ACQUISITION, DISPOSAL, SELF_TRANSFER)
- Taxable event detection
- Capital gains/loss calculation
- FIFO/LIFO cost basis methods
- Self-transfer identification

**Example:**
```typescript
it('identifies self-transfers correctly', () => {
  const tx: Transaction = {
    ...baseTransaction,
    fromAddress: ['wallet-address-1'],
    toAddress: ['wallet-address-2'],
  };

  const classification = classifyTransaction(tx, walletAddresses);

  expect(classification).toEqual({
    isTaxable: false,
    category: 'SELF_TRANSFER',
  });
});
```

### 3. Address Discovery

**Location:** `src/lib/blockchain.ts`  
**Test:** `tests/address-discovery-unit.test.ts`

**What to Test:**
- XPUB prefix inference (zpub→native, ypub→nested, xpub→legacy)
- Parallel batch processing
- GAP_LIMIT adherence (20 unused addresses)
- INITIAL_CHECK_LIMIT optimization
- Cache usage
- Performance metrics logging

**Example:**
```typescript
it('infers address types from XPUB prefix', () => {
  const content = fs.readFileSync(blockchainPath, 'utf-8');
  
  expect(content).toContain('inferAddressTypesFromXpub');
  expect(content).toContain('primaryType');
  expect(content).toContain('shouldCheckOthers');
  
  // Verify zpub/ypub skip fallback (specific types)
  expect(content).toContain('shouldCheckOthers: false');
});
```

### 4. Blockchain Data Fetching

**What to Test:**
- Multi-source failover (Blockstream, mempool.space, blockchain.info)
- Rate limiting handling
- Retry logic with exponential backoff
- Transaction parsing accuracy
- UTXO calculation
- Balance aggregation

**Challenges:**
- External API dependencies make unit testing difficult
- Performance tests with real XPUBs are preferred
- Mock data may not reflect real-world edge cases

### 5. AI Flows (Manual Testing Recommended)

**Location:** `src/ai/flows/`

**Testing Approach:**
- **Manual Testing**: Test AI responses with real wallet data
- **Integration Testing**: Validate flow input/output contracts
- **Type Safety**: Ensure Genkit flow types are correct

**Manual Test Cases:**
- Wallet insights chat responses
- Security recommendations accuracy
- Transaction summarization quality
- Proactive insight relevance

## Testing Considerations

### What We Test
✅ **Business logic** - Pure functions, calculations, classifications  
✅ **Data transformations** - Type conversions, parsing, formatting  
✅ **Cache mechanisms** - TTL, deduplication, invalidation  
✅ **Performance** - Load times, API efficiency, optimization validation  
✅ **Type safety** - TypeScript compilation and type correctness  

### What We Don't Extensively Test (Currently)
⚠️ **UI Components** - Manual testing preferred for visual validation  
⚠️ **AI Responses** - Non-deterministic; manual quality assessment needed  
⚠️ **External APIs** - Real blockchain data sources; mocking is impractical  
⚠️ **End-to-End Flows** - Complexity due to external dependencies  

### Why This Approach?
1. **Blockchain Data**: Real-time external APIs make comprehensive E2E testing challenging
2. **AI Features**: Non-deterministic responses require human evaluation
3. **Privacy Focus**: No backend database; all state is client-side
4. **Performance**: Real-world performance testing provides more value than mocked tests

## Continuous Integration

### GitHub Actions Testing Strategy

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint
      
      - name: Run unit tests
        run: npm test
      
      - name: Run performance tests
        env:
          TEST_XPUB: ${{ secrets.TEST_XPUB }}
        run: npx tsx tests/test-login-performance.ts
        if: env.TEST_XPUB != ''
```

### Test Maintenance

**When to Add Tests:**
- New business logic functions
- Complex data transformations
- Critical performance optimizations
- Bug fixes (regression prevention)

**When to Update Tests:**
- API contract changes
- Performance threshold adjustments
- Feature modifications
- Refactoring with behavioral changes

## Best Practices Summary

### DO ✅
- Write tests for pure functions and business logic
- Use TypeScript strict mode for type safety
- Test edge cases and error conditions
- Mock external dependencies (time, APIs, randomness)
- Measure and validate performance improvements
- Use descriptive test names that explain the behavior
- Group related tests with `describe` blocks
- Clean up after tests (restore mocks, timers)

### DON'T ❌
- Test implementation details (test behavior, not internals)
- Mock everything (some integration is valuable)
- Write flaky tests (use deterministic test data)
- Ignore performance regressions
- Skip type checking (it catches many bugs)
- Test third-party libraries (trust their own tests)

## Debugging Tests

### Vitest Debugging

```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run a single test in watch mode
npm test -- --watch wallet-snapshot-cache.test.ts

# Debug with Node inspector
node --inspect-brk ./node_modules/.bin/vitest run test-file.test.ts
```

### Common Issues

**Issue: Tests timing out**
```typescript
// Increase timeout for slow async operations
it('slow operation', async () => {
  const result = await slowFunction();
  expect(result).toBeDefined();
}, 10000); // 10 second timeout
```

**Issue: Mock timers not working**
```typescript
// Ensure real timers are restored
afterEach(() => {
  vi.useRealTimers();
});
```

**Issue: Cache pollution between tests**
```typescript
// Clear caches in beforeEach
beforeEach(() => {
  clearSnapshotCache();
  vi.clearAllMocks();
});
```

## Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/vitest)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)

### Project Documentation
- [AGENTS.md](/AGENTS.md) - Project architecture and setup
- [CONTRIBUTING.md](/CONTRIBUTING.md) - Contribution guidelines
- [README.md](/README.md) - Quick start and overview

### Internal Test Files
- `tests/wallet-snapshot-cache.test.ts` - Reference for unit testing patterns
- `tests/tax-calculations.test.ts` - Business logic testing example
- `tests/test-login-performance.ts` - Performance testing pattern

## Future Testing Enhancements

### Planned Improvements
- **Component Testing**: Add React Testing Library for UI components
- **E2E Testing**: Playwright/Cypress for critical user flows
- **Visual Regression**: Screenshot comparison for UI changes
- **API Mocking**: Better mock strategies for blockchain APIs
- **Coverage Thresholds**: Enforce minimum code coverage

### Contributing to Tests
When adding new features:
1. Write tests for new business logic
2. Update existing tests if behavior changes
3. Add performance tests for optimization claims
4. Document testing approach in PR description
5. Ensure CI passes before merging

---

**Last Updated:** December 2024  
**Maintainer:** BitSleuth Development Team  
**Testing Framework:** Vitest 4.x  
**Node Version:** 20.x (minimum: 18.x)
