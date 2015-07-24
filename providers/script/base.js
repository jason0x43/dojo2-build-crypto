(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports"], function (require, exports) {
    /**
     * Add a list of words, with rollover
     */
    function addWords() {
        var words = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            words[_i - 0] = arguments[_i];
        }
        var numWords = words.length;
        var sum = words[0];
        for (var i = 1; i < numWords; i++) {
            var a = sum;
            var b = words[i];
            var low = (a & 0xFFFF) + (b & 0xFFFF);
            var high = (a >> 16) + (b >> 16) + (low >> 16);
            sum = (high << 16) | (low & 0xFFFF);
        }
        return sum;
    }
    exports.addWords = addWords;
    /**
     * Specify the endian-ness of a integer values
     */
    (function (Endian) {
        Endian[Endian["Little"] = 0] = "Little";
        Endian[Endian["Big"] = 1] = "Big";
    })(exports.Endian || (exports.Endian = {}));
    var Endian = exports.Endian;
    /**
     * Convert an array of bytes to an array of 32-bit words. Words are assumed to be encoded in little-endian format (low
     * bytes are at lower indices).
     */
    function bytesToWords(bytes, endian) {
        if (endian === void 0) { endian = Endian.Big; }
        var numWords = Math.ceil(bytes.length / 4);
        var words = new Array(numWords);
        var s0 = 0 + 24 * endian;
        var s1 = 8 + 8 * endian;
        var s2 = 16 - 8 * endian;
        var s3 = 24 - 24 * endian;
        for (var i = 0; i < numWords; i++) {
            var j = 4 * i;
            words[i] =
                (bytes[j] << s0) |
                    (bytes[j + 1] << s1) |
                    (bytes[j + 2] << s2) |
                    (bytes[j + 3] << s3);
        }
        return words;
    }
    exports.bytesToWords = bytesToWords;
    /**
     * Convert an array of 32-bit words to an array of bytes. Words are encoded in big-endian format (high bytes are at
     * lower indices).
     */
    function wordsToBytes(words, endian) {
        if (endian === void 0) { endian = Endian.Big; }
        var numWords = words.length;
        var bytes = new Array(numWords * 4);
        var s0 = 0 + 24 * endian;
        var s1 = 8 + 8 * endian;
        var s2 = 16 - 8 * endian;
        var s3 = 24 - 24 * endian;
        for (var i = 0; i < numWords; i++) {
            var word = words[i];
            var j = 4 * i;
            bytes[j] = (word >> s0) & 0x0FF;
            bytes[j + 1] = (word >> s1) & 0x0FF;
            bytes[j + 2] = (word >> s2) & 0x0FF;
            bytes[j + 3] = (word >> s3) & 0x0FF;
        }
        return bytes;
    }
    exports.wordsToBytes = wordsToBytes;
});
//# sourceMappingURL=../../_debug/providers/script/base.js.map