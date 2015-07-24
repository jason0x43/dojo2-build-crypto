(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'dojo-core/has', 'dojo-core/global', 'dojo-core/has'], function (require, exports) {
    var has_1 = require('dojo-core/has');
    var global_1 = require('dojo-core/global');
    has_1.add('webcrypto', typeof global_1.default.SubtleCrypto !== 'undefined');
    has_1.add('typedarray', typeof global_1.default.ArrayBuffer !== 'undefined');
    var has_2 = require('dojo-core/has');
    exports.cache = has_2.cache;
    exports.add = has_2.add;
    exports.default = has_2.default;
});
//# sourceMappingURL=_debug/has.js.map