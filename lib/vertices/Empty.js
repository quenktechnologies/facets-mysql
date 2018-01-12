"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Either_1 = require("afpl/lib/monad/Either");
/**
 * Empty compiles to an empty string.
 */
var Empty = /** @class */ (function () {
    function Empty() {
    }
    Empty.prototype.escape = function (_params) {
        return Either_1.right('');
    };
    Empty.prototype.compile = function () {
        return Either_1.right('');
    };
    return Empty;
}());
exports.Empty = Empty;
//# sourceMappingURL=Empty.js.map