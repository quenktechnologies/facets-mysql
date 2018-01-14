"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SQLString = require("sqlstring");
var Either_1 = require("afpl/lib/monad/Either");
/**
 * Operator compiles to the supported SQL comparison.
 */
var Operator = /** @class */ (function () {
    function Operator(field, operator, value) {
        this.field = field;
        this.operator = operator;
        this.value = value;
    }
    Operator.prototype.escape = function (params) {
        params.push(this.value);
        return Either_1.right(SQLString.escapeId(this.field) + " " + this.operator + " ?");
    };
    Operator.prototype.compile = function () {
        return Either_1.right(this.field + " " + this.operator + " " + this.value);
    };
    return Operator;
}());
exports.Operator = Operator;
//# sourceMappingURL=Operator.js.map