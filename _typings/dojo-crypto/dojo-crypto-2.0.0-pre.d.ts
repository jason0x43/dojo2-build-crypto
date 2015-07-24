declare module 'dojo-crypto/has' {
	export { cache, add, default } from 'dojo-core/has';

}
declare module 'dojo-crypto/crypto' {
	/**
	 * crypto
	 *
	 * Architecture
	 * ------------
	 *
	 * The crypto API has two main functions: `getHash` and `getSign`. These functions return functions implementing the
	 * HashFunction and SignFunction interfaces, respectively. HashFunctions and SignFunctions are what user code calls to
	 * hash or sign data.
	 *
	 * Actual implementations are supplied by providers such as `providers/node.ts`. A provider is just a module exporting
	 * the two API functions `getHash` and `getSign`. Since each provider implements the public API, they can be used
	 * directly, although this should not generally be necessary.
	 *
	 * When user code calls this module's `getHash` function, the function immediately starts loading a provider and returns
	 * a wrapper function implementing the HashFunction API. The wrapper will defer all calls until the provider loads. Once
	 * the provider is loaded, the wrapper calls `getHash` on the provider to obtain a real HashFunction instance and
	 * resolves any outstanding calls. Future calls on the wrapper are passed directly to the created HashFunction instance.
	 *
	 * When the HashFunction wrapper's `create` method is called, it returns a wrapped Hasher instance. Like the
	 * HashFunction wrapper, the Hasher wrapper will defer calls until a provider is loaded and a real Hasher implementation
	 * has been created, at which point all future calls to methods on the wrapper are passed directly to the real Hasher.
	 *
	 * The current provider may be requested with the `getProvider` function. Since the initial provider is loaded
	 * asynchronously, this function returns a Promise<CryptoProvider>. The provider may be set using the `setProvider`
	 * function, which accepts a CryptoProvider.
	 */
	import { Codec, ByteBuffer } from 'dojo-core/encoding';
	import Promise from 'dojo-core/Promise';
	import { Sink } from 'dojo-core/streams/WritableStream';
	export type Data = string | ByteBuffer;
	/**
	 * An interface describing a cryptographic provider.
	 */
	export interface CryptoProvider {
	    getHash(algorithm: string): HashFunction;
	    getSign(algorithm: string): SignFunction;
	}
	/**
	 * A function that can hash a chunk of data.
	 */
	export interface HashFunction {
	    (data: ByteBuffer): Promise<ByteBuffer>;
	    (data: string, codec?: Codec): Promise<ByteBuffer>;
	    create<T extends Data>(codec?: Codec): Hasher<T>;
	    algorithm: string;
	}
	/**
	 * A signing function.
	 */
	export interface SignFunction {
	    (key: Key, data: ByteBuffer): Promise<ByteBuffer>;
	    (key: Key, data: string, codec?: Codec): Promise<ByteBuffer>;
	    create<T extends Data>(key: Key, codec?: Codec): Signer<T>;
	    algorithm: string;
	}
	/**
	 * Gets the HashFunction for a particular algorithm. The algorithm is specified as a string for simplicity and
	 * extensibility.
	 */
	export function getHash(algorithm: string): HashFunction;
	/**
	 * Gets the SignFunction for a particular algorithm. The algorithm is specified as a string for simplicity and
	 * extensibility.
	 */
	export function getSign(algorithm: string): SignFunction;
	/**
	 * Sets the implementation provider.
	 *
	 * The provider may either be a loaded provider or a Promise that will resolve to a provider.
	 */
	export function setProvider(_provider: CryptoProvider | Promise<CryptoProvider>): void;
	/**
	 * An object for hashing a data stream.
	 */
	export interface Hasher<T extends Data> extends Sink<T> {
	    digest: Promise<ByteBuffer>;
	}
	/**
	 * A cryptographic key.
	 */
	export interface Key {
	    algorithm: string;
	    data: Data;
	}
	/**
	 * An object for signing a data stream.
	 */
	export interface Signer<T extends Data> extends Sink<T> {
	    signature: Promise<ByteBuffer>;
	}

}
declare module 'dojo-crypto/providers/node/util' {
	import * as encoding from 'dojo-core/encoding';
	/**
	 * Returns the name of a Node encoding scheme that corresponds to a particular Codec. Exported for use by other node
	 * provider modules.
	 */
	export function getEncodingName(codec?: encoding.Codec): string;

}
declare module 'dojo-crypto/providers/node/hash' {
	import { HashFunction } from 'dojo-crypto/crypto';
	export default function getHash(algorithm: string): HashFunction;

}
declare module 'dojo-crypto/providers/node/sign' {
	import { SignFunction } from 'dojo-crypto/crypto';
	export default function getSign(algorithm: string): SignFunction;

}
declare module 'dojo-crypto/providers/node' {
	export { getHash, getSign };

}
declare module 'dojo-crypto/providers/script/base' {
	/**
	 * Notation:
	 *   - A "word" is a 32-bit interger
	 */
	import { ByteBuffer } from 'dojo-core/encoding';
	/**
	 * A script hash function
	 */
	export interface ScriptHash {
	    (data: ByteBuffer): ByteBuffer;
	    blockSize: number;
	}
	/**
	 * A general math function
	 */
	export interface MathFunction {
	    (...inputs: number[]): number;
	}
	/**
	 * Add a list of words, with rollover
	 */
	export function addWords(...words: number[]): number;
	/**
	 * Specify the endian-ness of a integer values
	 */
	export enum Endian {
	    Little = 0,
	    Big = 1,
	}
	/**
	 * Convert an array of bytes to an array of 32-bit words. Words are assumed to be encoded in little-endian format (low
	 * bytes are at lower indices).
	 */
	export function bytesToWords(bytes: ByteBuffer, endian?: Endian): number[];
	/**
	 * Convert an array of 32-bit words to an array of bytes. Words are encoded in big-endian format (high bytes are at
	 * lower indices).
	 */
	export function wordsToBytes(words: number[], endian?: Endian): number[];

}
declare module 'dojo-crypto/providers/script/sha32' {
	import { ScriptHash } from 'dojo-crypto/providers/script/base'; const sha224: ScriptHash;
	export { sha224 }; const sha256: ScriptHash;
	export { sha256 };

}
declare module 'dojo-crypto/providers/script/sha64' {
	import { ScriptHash } from 'dojo-crypto/providers/script/base'; const sha384: ScriptHash;
	export { sha384 }; const sha512: ScriptHash;
	export { sha512 };

}
declare module 'dojo-crypto/providers/script/sha1' {
	import { ScriptHash } from 'dojo-crypto/providers/script/base'; const sha1: ScriptHash;
	export default sha1;

}
declare module 'dojo-crypto/providers/script/md5' {
	/**
	 * A port of Paul Johnstone's MD5 implementation
	 * http://pajhome.org.uk/crypt/md5/index.html
	 *
	 * Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 *
	 * Original Dojo port by Tom Trenka
	 */
	import { ScriptHash } from 'dojo-crypto/providers/script/base'; const md5: ScriptHash;
	export default md5;

}
declare module 'dojo-crypto/providers/script/hash' {
	import { HashFunction } from 'dojo-crypto/crypto';
	import { ScriptHash } from 'dojo-crypto/providers/script/base';
	/**
	 * A mapping of crypto algorithm names to implementations
	 */
	export const ALGORITHMS: {
	    [key: string]: ScriptHash;
	};
	export default function getHash(algorithm: string): HashFunction;

}
declare module 'dojo-crypto/providers/script/hmac' {
	import { ByteBuffer } from 'dojo-core/encoding';
	import { ScriptHash } from 'dojo-crypto/providers/script/base';
	export default function hmac(hash: ScriptHash, data: ByteBuffer, key: ByteBuffer): ByteBuffer;

}
declare module 'dojo-crypto/providers/script/sign' {
	import { SignFunction } from 'dojo-crypto/crypto';
	export default function getSign(algorithm: string): SignFunction;

}
declare module 'dojo-crypto/providers/script' {
	export { getHash, getSign };

}
