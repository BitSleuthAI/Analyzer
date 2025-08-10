
// This file is a workaround for the "Error: ecc library invalid" issue
// that occurs in Next.js server environments due to WebAssembly dependencies
// in some crypto libraries. By centralizing the initialization of bitcoinjs-lib
// and its dependencies (bip32, ecpair) with a pure-JS secp256k1 implementation,
// we ensure that no WASM is required on the server.

import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from '@bitcoinerlab/secp256k1';
import { BIP32Factory } from 'bip32';
import { ECPairFactory } from 'ecpair';

// Initialize bitcoinjs-lib with the pure-JS ECC library
bitcoin.initEccLib(ecc);

// Initialize factories for bip32 and ecpair with the same ECC library
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

// Export the initialized libraries for use throughout the application
export { bitcoin, bip32, ECPair };
