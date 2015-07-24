(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'crypto', 'dojo-core/Promise', 'dojo-core/encoding', './util'], function (require, exports) {
    var crypto = require('crypto');
    var Promise_1 = require('dojo-core/Promise');
    var encoding_1 = require('dojo-core/encoding');
    var util_1 = require('./util');
    /**
     * A mapping of crypto algorithm names to their node equivalents
     */
    var ALGORITHMS = {
        md5: 'md5',
        sha1: 'sha1',
        sha256: 'sha256'
    };
    /**
     * Hashes a chunk of data.
     */
    function nodeHash(algorithm, data, codec) {
        var hash = crypto.createHash(algorithm);
        var encoding = util_1.getEncodingName(codec);
        hash.update(data, encoding);
        return Promise_1.default.resolve(hash.digest());
    }
    // Cache a resolved Promise to return from the stream methods.
    var resolvedPromise = Promise_1.default.resolve();
    /**
     * An object that can be used to hash a stream of data.
     */
    var NodeHasher = (function () {
        function NodeHasher(algorithm, encoding) {
            var _this = this;
            Object.defineProperty(this, '_hash', {
                configurable: true,
                value: crypto.createHash(algorithm)
            });
            Object.defineProperty(this, '_encoding', { value: encoding });
            Object.defineProperty(this, 'digest', {
                enumerable: true,
                value: new Promise_1.default(function (resolve, reject) {
                    Object.defineProperty(_this, '_resolve', { value: resolve });
                    Object.defineProperty(_this, '_reject', { value: reject });
                })
            });
        }
        NodeHasher.prototype.abort = function (reason) {
            if (this.digest.state !== Promise_1.State.Pending) {
                return this.digest;
            }
            // Release the reference to the Hash instance and reject the digest
            Object.defineProperty(this, '_hash', { value: undefined });
            this._reject(reason);
            return resolvedPromise;
        };
        NodeHasher.prototype.close = function () {
            if (this.digest.state !== Promise_1.State.Pending) {
                return this.digest;
            }
            this._resolve(this._hash.digest());
            // Release the reference to the Hash instance
            Object.defineProperty(this, '_hash', { value: undefined });
            return resolvedPromise;
        };
        NodeHasher.prototype.write = function (chunk) {
            if (this.digest.state !== Promise_1.State.Pending) {
                return this.digest;
            }
            var _chunk = chunk;
            // Node can't work with Arrays, so convert them to Buffers
            // The node typing for Sign#update is incorrect -- it shares the same signature as Hash#update
            try {
                if (Array.isArray(chunk)) {
                    this._hash.update(new Buffer(chunk, this._encoding));
                }
                else {
                    this._hash.update(chunk, this._encoding);
                }
                return resolvedPromise;
            }
            catch (error) {
                this._reject(error);
                return this.digest;
            }
        };
        return NodeHasher;
    })();
    function getHash(algorithm) {
        var hasher = function (data, codec) {
            if (codec === void 0) { codec = encoding_1.utf8; }
            return nodeHash(algorithm, data, codec);
        };
        hasher.create = function (codec) {
            if (codec === void 0) { codec = encoding_1.utf8; }
            return new NodeHasher(algorithm, util_1.getEncodingName(codec));
        };
        hasher.algorithm = algorithm;
        return hasher;
    }
    exports.default = getHash;
});
//# sourceMappingURL=../../_debug/providers/node/hash.js.map