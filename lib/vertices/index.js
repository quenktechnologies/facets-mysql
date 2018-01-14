"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var facets_dsl_1 = require("@quenk/facets-dsl");
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
/**
 * and Term provider.
 */
exports.and = function (_) {
    return function (left) {
        return function (right) { return new And_1.And(left, right); };
    };
};
/**
 * or Term provider.
 */
exports.or = function (_) {
    return function (left) {
        return function (right) { return new Or_1.Or(left, right); };
    };
};
/**
 * empty Term provider.
 */
exports.empty = function () { return new Empty_1.Empty(); };
/**
 * like Term provider.
 */
exports.like = function (_) {
    return function (_a) {
        var field = _a.field, value = _a.value;
        return new Like_1.Like(field, value);
    };
};
/**
 * operator Term provider.
 */
exports.operator = function (_) {
    return function (_a) {
        var field = _a.field, operator = _a.operator, value = _a.value;
        return new Operator_1.Operator(field, operator, value);
    };
};
exports.defaultTerms = function () { return ({
    and: exports.and,
    or: exports.or,
    empty: exports.empty
}); };
exports.defaultPolicies = function () { return ({
    number: {
        type: 'number',
        operators: ['=', '>=', '>=', '<=', '>=', '<'],
        Term: exports.operator
    },
    string: {
        type: 'string',
        operators: ['='],
        term: exports.like
    }
}); };
exports.defaultOptions = function () { return ({
    maxFilters: 100
}); };
exports.compile$$$ = facets_dsl_1.compile(exports.defaultTerms())(exports.defaultPolicies())(exports.defaultOptions());
//# sourceMappingURL=index.js.map