(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './script/hash', './script/sign'], function (require, exports) {
    var hash_1 = require('./script/hash');
    exports.getHash = hash_1.default;
    var sign_1 = require('./script/sign');
    exports.getSign = sign_1.default;
});
//# sourceMappingURL=../_debug/providers/script.js.map