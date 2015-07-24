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
        hmac: 'hmac'
    };
    var resolvedPromise = Promise_1.default.resolve();
    /**
     * Generates a signature for a chunk of data.
     */
    function sign(algorithm, key, data, codec) {
        var hashAlgorithm = key.algorithm;
        var hmac = crypto.createHmac(hashAlgorithm, key.data);
        var encoding = util_1.getEncodingName(codec);
        // Node crypto requires the input data to be a string or Buffer, so convert arrays to Buffers
        if (Array.isArray(data)) {
            data = new Buffer(data);
        }
        hmac.update(data, encoding);
        return Promise_1.default.resolve(hmac.digest());
    }
    /**
     * An object that can be used to generate a signature for a stream of data.
     */
    var NodeSigner = (function () {
        function NodeSigner(algorithm, key, encoding) {
            var _this = this;
            Object.defineProperty(this, 'signature', {
                value: new Promise_1.default(function (resolve, reject) {
                    Object.defineProperty(_this, '_resolve', { value: resolve });
                    Object.defineProperty(_this, '_reject', { value: reject });
                })
            });
            try {
                // Throw a useful error if the key is invalid
                if (typeof key.data !== 'string' && !(key.data instanceof Buffer)) {
                    throw new Error('Key data must be a non-null string or buffer');
                }
                Object.defineProperty(this, '_sign', {
                    configurable: true,
                    value: crypto.createHmac(key.algorithm, key.data)
                });
                Object.defineProperty(this, '_encoding', { value: encoding });
            }
            catch (error) {
                this._reject(error);
            }
        }
        NodeSigner.prototype.abort = function (reason) {
            if (this.signature.state !== Promise_1.State.Pending) {
                return this.signature;
            }
            // Release the reference to the Hmac/Signer instance and reject the signature
            Object.defineProperty(this, '_sign', { value: undefined });
            this._reject(reason);
            return resolvedPromise;
        };
        NodeSigner.prototype.close = function () {
            if (this.signature.state !== Promise_1.State.Pending) {
                return this.signature;
            }
            var result = this._sign.digest();
            // Release the reference to the Hmac/Signer instance
            Object.defineProperty(this, '_sign', { value: undefined });
            this._resolve(result);
            return resolvedPromise;
        };
        NodeSigner.prototype.write = function (chunk) {
            if (this.signature.state !== Promise_1.State.Pending) {
                return this.signature;
            }
            var _chunk = chunk;
            // Node can't work with Arrays, so convert them to Buffers
            // The node typing for Sign#update is incorrect -- it shares the same signature as Hash#update
            try {
                if (Array.isArray(chunk)) {
                    this._sign.update.call(this._sign, new Buffer(chunk, this._encoding));
                }
                else {
                    this._sign.update.call(this._sign, chunk, this._encoding);
                }
                return resolvedPromise;
            }
            catch (error) {
                this._reject(error);
                return this.signature;
            }
        };
        return NodeSigner;
    })();
    function getSign(algorithm) {
        if (!(algorithm in ALGORITHMS)) {
            throw new Error('invalid algorithm; available algorithms are [ \'' + Object.keys(ALGORITHMS).join('\', \'') + '\' ]');
        }
        var signFunction = function (key, data, codec) {
            if (codec === void 0) { codec = encoding_1.utf8; }
            return sign(algorithm, key, data, codec);
        };
        signFunction.create = function (key, codec) {
            if (codec === void 0) { codec = encoding_1.utf8; }
            return new NodeSigner(algorithm, key, util_1.getEncodingName(codec));
        };
        return signFunction;
    }
    exports.default = getSign;
});
//# sourceMappingURL=../../_debug/providers/node/sign.js.map