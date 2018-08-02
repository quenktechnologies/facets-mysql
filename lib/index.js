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
/**
 * defaultTerms for supporting the DSL.
 */
exports.defaultTerms = {
    and: exports.and,
    or: exports.or,
    empty: exports.empty
};
/**
 * defaultPolicies that can be specified as strings instead of maps.
 */
exports.defaultPolicies = {
    number: {
        type: 'number',
        operators: ['=', '>=', '>=', '<=', '>=', '<'],
        term: exports.operator
    },
    string: {
        type: 'string',
        operators: ['='],
        term: exports.like
    },
    date: {
        type: 'date',
        operators: ['=', '>=', '>=', '<=', '>=', '<'],
        term: exports.operator
    },
};
/**
 * defaultOptions used during compilation.
 */
exports.defaultOptions = {
    maxFilters: 100
};
/**
 * compile a source string into SQL.
 */
exports.compile = facets_dsl_1.compile(exports.defaultTerms)(exports.defaultPolicies);
/**
 * compileE compiles to SQL with user supplied values replaced by '?'.
 *
 * The actual values are fed into the provided array.
 */
exports.compileE = function (options) { return function (enabled) {
    return function (params) { return function (source) {
        return (facets_dsl_1.source2Term({
            terms: exports.defaultTerms,
            policies: exports.defaultPolicies,
            options: options
        })(enabled)(source)).chain(function (t) { return t.escape(params); });
    }; };
}; };
//# sourceMappingURL=index.js.map