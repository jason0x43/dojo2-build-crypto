(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", 'dojo-core/encoding'], function (require, exports) {
    var encoding = require('dojo-core/encoding');
    /**
     * Returns the name of a Node encoding scheme that corresponds to a particular Codec. Exported for use by other node
     * provider modules.
     */
    function getEncodingName(codec) {
        switch (codec) {
            case encoding.ascii:
                return 'ascii';
            case encoding.utf8:
                return 'utf8';
            case encoding.base64:
                return 'base64';
            case encoding.hex:
                return 'hex';
        }
    }
    exports.getEncodingName = getEncodingName;
});
//# sourceMappingURL=../../_debug/providers/node/util.js.map