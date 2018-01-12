"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Either_1 = require("afpl/lib/monad/Either");
/**
 * Like compiles to the SQL like condition.
 */
var Like = /** @class */ (function () {
    function Like(field, value) {
        this.field = field;
        this.value = value;
    }
    Like.prototype.escape = function (params) {
        params.push(this.value);
        return Either_1.right(this.field + " LIKE CONCAT('%', ?, '%')");
    };
    Like.prototype.compile = function () {
        return Either_1.right(this.field + " LIKE '%" + this.value + "%'");
    };
    return Like;
}());
exports.Like = Like;
//# sourceMappingURL=Like.js.map