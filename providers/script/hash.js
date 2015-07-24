(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'dojo-core/Promise', 'dojo-core/encoding', './sha32', './sha64', './sha1', './md5'], function (require, exports) {
    var Promise_1 = require('dojo-core/Promise');
    var encoding_1 = require('dojo-core/encoding');
    var sha32_1 = require('./sha32');
    var sha64_1 = require('./sha64');
    var sha1_1 = require('./sha1');
    var md5_1 = require('./md5');
    /**
     * A mapping of crypto algorithm names to implementations
     */
    exports.ALGORITHMS = {
        md5: md5_1.default,
        sha1: sha1_1.default,
        sha224: sha32_1.sha224,
        sha256: sha32_1.sha256,
        sha384: sha64_1.sha384,
        sha512: sha64_1.sha512
    };
    /**
     * Hashes a chunk of data.
     */
    function hash(algorithm, data, codec) {
        if (typeof data === 'string') {
            data = codec.encode(data);
        }
        return Promise_1.default.resolve(exports.ALGORITHMS[algorithm](data));
    }
    // Cache a resolved Promise to return from the stream methods.
    var resolvedPromise = Promise_1.default.resolve();
    /**
     * An object that can be used to hash a stream of data.
     */
    var ScriptHasher = (function () {
        function ScriptHasher(algorithm, codec) {
            var _this = this;
            Object.defineProperty(this, '_hash', {
                configurable: true,
                value: exports.ALGORITHMS[algorithm]
            });
            Object.defineProperty(this, '_codec', { value: codec });
            Object.defineProperty(this, '_buffer', {
                writable: true,
                value: []
            });
            Object.defineProperty(this, 'digest', {
                enumerable: true,
                value: new Promise_1.default(function (resolve, reject) {
                    Object.defineProperty(_this, '_resolve', { value: resolve });
                    Object.defineProperty(_this, '_reject', { value: reject });
                })
            });
        }
        ScriptHasher.prototype.abort = function (reason) {
            if (this.digest.state !== Promise_1.State.Pending) {
                return this.digest;
            }
            // Release the reference to the internal buffer and reject the digest
            this._buffer = undefined;
            this._reject(reason);
            return resolvedPromise;
        };
        ScriptHasher.prototype.close = function () {
            if (this.digest.state !== Promise_1.State.Pending) {
                return this.digest;
            }
            this._resolve(this._hash(this._buffer));
            // Release the reference to the buffer
            this._buffer = undefined;
            return resolvedPromise;
        };
        ScriptHasher.prototype.write = function (chunk) {
            if (this.digest.state !== Promise_1.State.Pending) {
                return this.digest;
            }
            try {
                if (typeof chunk === 'string') {
                    var chunkString = chunk;
                    this._buffer = this._buffer.concat(this._codec.encode(chunkString));
                }
                else {
                    var chunkBuffer = chunk;
                    this._buffer = this._buffer.concat(chunkBuffer);
                }
                return resolvedPromise;
            }
            catch (error) {
                this._reject(error);
                return this.digest;
            }
        };
        return ScriptHasher;
    })();
    function getHash(algorithm) {
        var hasher = function (data, codec) {
            if (codec === void 0) { codec = encoding_1.utf8; }
            return hash(algorithm, data, codec);
        };
        hasher.create = function (codec) {
            if (codec === void 0) { codec = encoding_1.utf8; }
            return new ScriptHasher(algorithm, codec);
        };
        hasher.algorithm = algorithm;
        return hasher;
    }
    exports.default = getHash;
});
//# sourceMappingURL=../../_debug/providers/script/hash.js.map