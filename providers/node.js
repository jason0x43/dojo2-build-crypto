(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './node/hash', './node/sign'], function (require, exports) {
    var hash_1 = require('./node/hash');
    exports.getHash = hash_1.default;
    var sign_1 = require('./node/sign');
    exports.getSign = sign_1.default;
});
//# sourceMappingURL=../_debug/providers/node.js.map