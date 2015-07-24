/*
 * A port of Paul Johnstone's SHA1 implementation
 *
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 *
 * Dojo port by Tom Trenka
 */
(function (deps, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(deps, factory);
    }
})(["require", "exports", './base'], function (require, exports) {
    var base_1 = require('./base');
    var S = function (n, c) {
        return (n << c) | (n >>> (32 - c));
    };
    var FT = function (t, b, c, d) {
        if (t < 20) {
            return (b & c) | (~b & d);
        }
        if (t < 40) {
            return b ^ c ^ d;
        }
        if (t < 60) {
            return (b & c) | (b & d) | (c & d);
        }
        return b ^ c ^ d;
    };
    var KT = function (t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
    };
    var sha1 = function (bytes) {
        var numBits = bytes.length * 8;
        var words = base_1.bytesToWords(bytes);
        // Pad the input
        words[numBits >> 5] |= 0x80 << (24 - numBits % 32);
        words[((numBits + 64 >> 9) << 4) + 15] = numBits;
        var w = new Array(80);
        // Initialize state
        var a = 0x67452301;
        var b = 0xEFCDAB89;
        var c = 0x98BADCFE;
        var d = 0x10325476;
        var e = 0xC3D2E1F0;
        var numWords = words.length;
        for (var i = 0; i < numWords; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;
            for (var t = 0; t < 80; t++) {
                if (t < 16) {
                    w[t] = words[i + t];
                }
                else {
                    w[t] = S(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
                }
                var temp = base_1.addWords(S(a, 5), FT(t, b, c, d), e, w[t], KT(t));
                e = d;
                d = c;
                c = S(b, 30);
                b = a;
                a = temp;
            }
            a = base_1.addWords(a, olda);
            b = base_1.addWords(b, oldb);
            c = base_1.addWords(c, oldc);
            d = base_1.addWords(d, oldd);
            e = base_1.addWords(e, olde);
        }
        return base_1.wordsToBytes([a, b, c, d, e]);
    };
    sha1.blockSize = 512;
    exports.default = sha1;
});
//# sourceMappingURL=../../_debug/providers/script/sha1.js.map