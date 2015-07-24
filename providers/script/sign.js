(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'dojo-core/Promise', 'dojo-core/encoding', './hmac', './hash'], function (require, exports) {
    var Promise_1 = require('dojo-core/Promise');
    var encoding_1 = require('dojo-core/encoding');
    var hmac_1 = require('./hmac');
    var hash_1 = require('./hash');
    /**
     * A mapping of crypto algorithm names to their node equivalents
     */
    var ALGORITHMS = {
        hmac: hmac_1.default
    };
    var resolvedPromise = Promise_1.default.resolve();
    /**
     * Generates a signature for a chunk of data.
     *
     * The algorithm parameter is currently ignored.
     */
    function sign(algorithm, key, data, codec) {
        var hash = hash_1.ALGORITHMS[key.algorithm];
        var keyData = typeof key.data === 'string' ?
            encoding_1.utf8.encode(key.data) : key.data;
        var byteData = typeof data === 'string' ?
            codec.encode(data) : data;
        return Promise_1.default.resolve(hmac_1.default(hash, byteData, keyData));
    }
    /**
     * An object that can be used to generate a signature for a stream of data.
     */
    var ScriptSigner = (function () {
        /**
         * The algorithm is currently ignored as 'hmac' is the only supported algorithm.
         */
        function ScriptSigner(algorithm, key, codec) {
            var _this = this;
            if (key.data == null) {
                throw new Error('Key data must be non-null');
            }
            if (!(hash_1.ALGORITHMS[key.algorithm])) {
                throw new Error('Invalid hash algorithm');
            }
            Object.defineProperty(this, '_hash', {
                configurable: true,
                value: hash_1.ALGORITHMS[key.algorithm]
            });
            Object.defineProperty(this, '_codec', { value: codec });
            Object.defineProperty(this, '_key', {
                value: typeof key.data === 'string' ? encoding_1.utf8.encode(key.data) : key.data
            });
            Object.defineProperty(this, '_buffer', {
                writable: true,
                value: []
            });
            Object.defineProperty(this, 'signature', {
                value: new Promise_1.default(function (resolve, reject) {
                    Object.defineProperty(_this, '_resolve', { value: resolve });
                    Object.defineProperty(_this, '_reject', { value: reject });
                })
            });
        }
        ScriptSigner.prototype.abort = function (reason) {
            if (this.signature.state === Promise_1.State.Rejected) {
                return this.signature;
            }
            this._reject(reason);
            return resolvedPromise;
        };
        ScriptSigner.prototype.close = function () {
            if (this.signature.state === Promise_1.State.Rejected) {
                return this.signature;
            }
            try {
                this._resolve(hmac_1.default(this._hash, this._buffer, this._key));
                return Promise_1.default.resolve();
            }
            catch (error) {
                this._reject(error);
                return Promise_1.default.reject(error);
            }
        };
        ScriptSigner.prototype.write = function (chunk) {
            if (this.signature.state === Promise_1.State.Rejected) {
                return this.signature;
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
                return this.signature;
            }
        };
        return ScriptSigner;
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
            return new ScriptSigner(algorithm, key, codec);
        };
        return signFunction;
    }
    exports.default = getSign;
});
//# sourceMappingURL=../../_debug/providers/script/sign.js.map