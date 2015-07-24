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
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'dojo-core/Promise', './has'], function (require, exports) {
    var Promise_1 = require('dojo-core/Promise');
    var has_1 = require('./has');
    /**
     * Supported hash algorithms
     */
    var HASH_ALGORITHMS = {
        md5: true,
        sha1: true,
        sha256: true
    };
    /**
     * Supported signing algorithms
     */
    var SIGN_ALGORITHMS = {
        hmac: true
    };
    /**
     * The current provider. Providers supply concrete implementations of the API described here. Users should not typically
     * need to access providers directly.
     */
    var provider;
    var providerPromise;
    /**
     * Gets the HashFunction for a particular algorithm. The algorithm is specified as a string for simplicity and
     * extensibility.
     */
    function getHash(algorithm) {
        // If a provider has been loaded, defer to its getHash
        if (provider) {
            return provider.getHash(algorithm);
        }
        // Before a provider has been loaded, check whether the requested algorithm is one of the standard set. After a
        // provider is loaded, it will handle algorithm verification itself.
        if (!(algorithm in HASH_ALGORITHMS)) {
            throw new Error('invalid algorithm; available algorithms are [ \'' +
                Object.keys(HASH_ALGORITHMS).join('\', \'') + '\' ]');
        }
        var realHash;
        var hashPromise = new Promise_1.default(function (resolve, reject) {
            getProvider().then(function (provider) {
                realHash = provider.getHash(algorithm);
                resolve(realHash);
            }).catch(function (error) {
                reject(error);
            });
        });
        // Return a wrapper that will defer calls to the hash until a provider has been loaded.
        var hashFunction = function (data, codec) {
            if (realHash) {
                return realHash(data, codec);
            }
            return hashPromise.then(function (hash) {
                return hash(data, codec);
            });
        };
        // Return a wrapper class that will defer calls until a provider has been loaded and an actual Hasher instance has
        // been created.
        hashFunction.create = function (codec) {
            if (realHash) {
                hashFunction.create = realHash.create.bind(realHash);
                return realHash.create(codec);
            }
            return new HasherWrapper(hashPromise, codec);
        };
        return hashFunction;
    }
    exports.getHash = getHash;
    /**
     * Gets the SignFunction for a particular algorithm. The algorithm is specified as a string for simplicity and
     * extensibility.
     */
    function getSign(algorithm) {
        // If a provider has been loaded, defer to its getSign
        if (provider) {
            return provider.getSign(algorithm);
        }
        // Before a provider has been loaded, check whether the requested algorithm is one of the standard set. After a
        // provider is loaded, it will handle algorithm verification itself.
        if (!(algorithm in SIGN_ALGORITHMS)) {
            throw new Error('invalid algorithm; available algorithms are [ \'' +
                Object.keys(SIGN_ALGORITHMS).join('\', \'') + '\' ]');
        }
        var realSign;
        var signPromise = new Promise_1.default(function (resolve, reject) {
            getProvider().then(function (provider) {
                realSign = provider.getSign(algorithm);
                resolve(realSign);
            }).catch(function (error) {
                reject(error);
            });
        });
        // Return a wrapper that will defer calls to the sign function until a provider has been loaded.
        var signFunction = function (key, data, codec) {
            if (realSign) {
                return realSign(key, data, codec);
            }
            return signPromise.then(function (sign) {
                return sign(key, data, codec);
            });
        };
        // Return a wrapper class that will defer calls until a provider has been loaded and an actual SignFunction instance
        // has been created.
        signFunction.create = function (key, codec) {
            return new SignerWrapper(signPromise, key, codec);
        };
        return signFunction;
    }
    exports.getSign = getSign;
    /**
     * Returns a promise that resolves to the current provider object.
     */
    function getProvider() {
        if (provider) {
            return Promise_1.default.resolve(provider);
        }
        if (providerPromise) {
            return providerPromise;
        }
        providerPromise = new Promise_1.default(function (resolve, reject) {
            // Load a platform-specific default provider.
            if (typeof define === 'function' && define.amd) {
                function loadProvider(mid) {
                    require([mid], function (_provider) {
                        // Don't overwrite a provider if one has already been set
                        if (!provider) {
                            provider = _provider;
                        }
                        resolve(provider);
                    });
                }
                if (has_1.default('host-node')) {
                    loadProvider('./providers/node');
                }
                else if (has_1.default('webcrypto')) {
                    loadProvider('./providers/webcrypto');
                }
                else {
                    loadProvider('./providers/script');
                }
            }
            else if (has_1.default('host-node')) {
                provider = require('./providers/node');
                resolve(provider);
            }
            else {
                reject(new Error('Unknown environment or loader'));
            }
        });
        return providerPromise;
    }
    /**
     * Sets the implementation provider.
     *
     * The provider may either be a loaded provider or a Promise that will resolve to a provider.
     */
    function setProvider(_provider) {
        providerPromise = provider = null;
        if (_provider) {
            if (_provider.then) {
                providerPromise = _provider;
            }
            else if (_provider.getHash) {
                provider = _provider;
            }
        }
    }
    exports.setProvider = setProvider;
    /**
     * Call a method that returns a promise, or return a resolved Promise if the method doesn't exist on the object
     */
    function callOrNoop(object, methodName) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var method = object[methodName];
        if (!method) {
            return Promise_1.default.resolve();
        }
        return method.apply(object, args);
    }
    function bindOrUndefined(object, methodName) {
        var method = object[methodName];
        if (method) {
            return method.bind(object);
        }
    }
    /**
     * A wrapper around a Promise<HashFunction> that will defer calls while a provider is asynchronously loaded.
     */
    var HasherWrapper = (function () {
        function HasherWrapper(hashPromise, codec) {
            var _this = this;
            Object.defineProperty(this, '_promise', {
                value: new Promise_1.default(function (resolve, reject) {
                    hashPromise.then(function (hashFunction) {
                        // When the hash function resolves, create a Hasher and replace this object's methods with
                        // pointers to the corresponding methods on the Hasher.
                        var hasher = hashFunction.create(codec);
                        _this.abort = bindOrUndefined(hasher, 'abort');
                        _this.close = bindOrUndefined(hasher, 'close');
                        _this.start = bindOrUndefined(hasher, 'start');
                        _this.write = bindOrUndefined(hasher, 'write');
                        resolve(hasher);
                    }, function (error) {
                        reject(error);
                    });
                })
            });
            Object.defineProperty(this, 'digest', {
                enumerable: true,
                value: new Promise_1.default(function (resolve, reject) {
                    _this._promise.then(function (hasher) {
                        resolve(hasher.digest);
                    }, function (error) {
                        reject(error);
                    });
                })
            });
        }
        // Sink methods; the provider may or may not implement these, so call them with callOrNoop
        HasherWrapper.prototype.abort = function (reason) {
            return this._promise.then(function (hasher) {
                return callOrNoop(hasher, 'abort', reason);
            });
        };
        HasherWrapper.prototype.close = function () {
            return this._promise.then(function (hasher) {
                return callOrNoop(hasher, 'close');
            });
        };
        HasherWrapper.prototype.start = function (error) {
            return this._promise.then(function (hasher) {
                return callOrNoop(hasher, 'start', error);
            });
        };
        HasherWrapper.prototype.write = function (chunk) {
            return this._promise.then(function (hasher) {
                return callOrNoop(hasher, 'write', chunk);
            });
        };
        return HasherWrapper;
    })();
    /**
     * A wrapper around a Promise<SignFunction> that will defer calls while a provider is asynchronously loaded.
     */
    var SignerWrapper = (function () {
        function SignerWrapper(signPromise, key, codec) {
            var _this = this;
            Object.defineProperty(this, '_promise', {
                value: new Promise_1.default(function (resolve, reject) {
                    signPromise.then(function (signFunction) {
                        // When the sign function resolves, create a Signer and replace this object's methods with
                        // pointers to the corresponding methods on the Signer.
                        var signer = signFunction.create(key, codec);
                        _this.abort = bindOrUndefined(signer, 'abort');
                        _this.close = bindOrUndefined(signer, 'close');
                        _this.start = bindOrUndefined(signer, 'start');
                        _this.write = bindOrUndefined(signer, 'write');
                        resolve(signer);
                    }).catch(function (error) {
                        reject(error);
                    });
                })
            });
            Object.defineProperty(this, 'signature', {
                value: new Promise_1.default(function (resolve, reject) {
                    _this._promise.then(function (signer) {
                        resolve(signer.signature);
                    }, function (error) {
                        reject(error);
                    });
                })
            });
        }
        // Sink methods; the provider may or may not implement these, so call them with callOrNoop
        SignerWrapper.prototype.abort = function (reason) {
            return this._promise.then(function (signer) {
                return callOrNoop(signer, 'abort', reason);
            });
        };
        SignerWrapper.prototype.close = function () {
            return this._promise.then(function (signer) {
                return callOrNoop(signer, 'close');
            });
        };
        SignerWrapper.prototype.start = function (error) {
            return this._promise.then(function (signer) {
                return callOrNoop(signer, 'start', error);
            });
        };
        SignerWrapper.prototype.write = function (chunk) {
            return this._promise.then(function (signer) {
                return callOrNoop(signer, 'write', chunk);
            });
        };
        return SignerWrapper;
    })();
});
//# sourceMappingURL=_debug/crypto.js.map