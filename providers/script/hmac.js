(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    function hmac(hash, data, key) {
        // Prepare the key
        if (key.length > 4 * 16 * 32) {
            key = hash(key);
        }
        // Set up the pads
        var numBytes = Math.ceil(hash.blockSize / 32) * 4;
        var ipad = new Array(numBytes);
        var opad = new Array(numBytes);
        for (var i = 0; i < numBytes; i++) {
            ipad[i] = key[i] ^ 0x36;
            opad[i] = key[i] ^ 0x5c;
        }
        // Make the final digest
        var r1 = hash(ipad.concat(data));
        var r2 = hash(opad.concat(r1));
        return r2;
    }
    exports.default = hmac;
    ;
});
//# sourceMappingURL=../../_debug/providers/script/hmac.js.map