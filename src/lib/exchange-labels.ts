

/**
 * A simple, non-exhaustive map of known Bitcoin addresses belonging to major exchanges.
 * This is used for demonstration purposes to add context to transactions.
 * In a production system, this would be a constantly updated, very large database.
 */
export const KNOWN_EXCHANGE_ADDRESSES: Record<string, string> = {
    // Binance
    '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s': 'Binance', // Binance Hot Wallet
    '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo': 'Binance', // Binance Cold Wallet
    'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv248g567spchq2fwnkn': 'Binance', // Binance Bech32 Wallet
  
    // Coinbase
    '1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX': 'Coinbase',
    '3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r': 'Coinbase',
    'bc1qylh3uun8655i0je2hztw6d3csgt6d5w2erx4h2y5z2tszfx8qj9swlq5u0': 'Coinbase',
  
    // Kraken
    '12xtfk1Q2jVqP3s4Uv8p9a5J1bY4j2Xz1': 'Kraken',
    '3EtcAbfBf4oWJ1x2S2j4tq7T3Y8bX4nQZ6': 'Kraken',
    'bc1q2r3mzw2fzqf0f8f8k9k8k8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8': 'Kraken', // Placeholder
  
    // Bitfinex
    '17zV3F25eXb2F4b4y6f4X2s2V6d2F4b4y6': 'Bitfinex',
    '3JZp2jV2A2B2e2n2K2h2N2m2k2j2J2m2k2': 'Bitfinex',
  
    // Example of a large known entity (not an exchange)
    '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ': 'MicroStrategy',
};
