"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Comparison_1 = require("./Comparison");
exports.Comparison = Comparison_1.Comparison;
var And_1 = require("./And");
exports.And = And_1.And;
var Empty_1 = require("./Empty");
exports.Empty = Empty_1.Empty;
var Like_1 = require("./Like");
exports.Like = Like_1.Like;
var Or_1 = require("./Or");
exports.Or = Or_1.Or;
var Operator_1 = require("./Operator");
exports.Operator = Operator_1.Operator;
exports.and = function (_) {
    return function (left) {
        return function (right) { return new And_1.And(left, right); };
    };
};
exports.or = function (_) {
    return function (left) {
        return function (right) { return new Or_1.Or(left, right); };
    };
};
exports.empty = function () { return new Empty_1.Empty(); };
exports.like = function (_) {
    return function (_a) {
        var field = _a.field, value = _a.value;
        return new Like_1.Like(field, value);
    };
};
exports.operator = function (_) {
    return function (_a) {
        var field = _a.field, operator = _a.operator, value = _a.value;
        return new Operator_1.Operator(field, operator, value);
    };
};
/**
 * availablePolicies for constructing filters from SQL.
 */
exports.availablePolicies = {
    number: {
        type: 'number',
        operators: ['=', '>=', '>=', '<=', '>=', '<'],
        vertex: exports.operator
    },
    string: {
        type: 'string',
        operators: ['='],
        vertex: exports.like
    }
};
//# sourceMappingURL=index.js.map