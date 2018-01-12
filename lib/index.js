"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var facets_parser_1 = require("@quenk/facets-parser");
exports.parse = facets_parser_1.parse;
var match_1 = require("@quenk/match");
var Either_1 = require("afpl/lib/monad/Either");
var Maybe_1 = require("afpl/lib/monad/Maybe");
var FilterNode = facets_parser_1.Node.Filter;
exports.FilterNode = FilterNode;
/**
 * defaultOptions
 */
exports.defaultOptions = {
    maxFilters: 100,
};
;
/**
 * maxFilterExceededErr indicates the maximum amount of filters allowed
 * has been surpassed.
 */
exports.maxFilterExceededErr = function (n, max) {
    return ({ n: n, max: max, message: "Max " + max + " filters are allowed, got " + n + "!" });
};
/**
 * invalidFilterFieldErr invalid indicates the filter supplied is not supported.
 */
var invalidFilterFieldErr = function (_a) {
    var field = _a.field, operator = _a.operator, value = _a.value;
    return ({ field: field, operator: operator, value: value, message: "Invalid field " + field + "!" });
};
/**
 * invalidFilterOperatorErr indicates an invalid operator was supplied.
 */
var invalidFilterOperatorErr = function (_a) {
    var field = _a.field, operator = _a.operator, value = _a.value;
    return ({ field: field, operator: operator, value: value, message: "Invalid operator '" + operator + "' used with field '" + field + "'!" });
};
/**
 * invalidFilterType indicates the value used with the filter is the incorrect type.
 */
var invalidFilterType = function (_a, typ) {
    var field = _a.field, operator = _a.operator, value = _a.value;
    return ({
        field: field,
        operator: operator,
        value: value,
        message: "Invalid type '" + typeof value + "' for field '" + field + "', expected type of '" + typ + "'!"
    });
};
/**
 * checkType to ensure they match.
 */
var checkType = function (typ, value) {
    return (Array.isArray(value) && typ === 'array') ? true :
        (typeof value === typ) ? true : false;
};
/**
 * count the number of filters in the AST.
 */
exports.count = function (n) { return match_1.match(n)
    .caseOf(facets_parser_1.Node.And, function (n) { return exports.count(n.left) + exports.count(n.right); })
    .caseOf(facets_parser_1.Node.Or, function (n) { return exports.count(n.left) + exports.count(n.right); })
    .caseOf(facets_parser_1.Node.Filter, function () { return 1; })
    .orElse(function () { return 0; })
    .end(); };
/**
 * ensureFilterLimit prevents abuse via excessively long queries.
 */
exports.ensureFilterLimit = function (n, max) {
    return (max <= 0) ?
        Either_1.Either
            .right(n) :
        Either_1.Either
            .right(exports.count(n))
            .chain(function (c) { return (c > max) ?
            Either_1.Either
                .left(exports.maxFilterExceededErr(c, max)) :
            Either_1.Either
                .right(n); });
};
/**
 * value2JS converts a parseed value node into a JS value.
 */
exports.value2JS = function (v) { return match_1.match(v)
    .caseOf(facets_parser_1.Node.List, function (_a) {
    var members = _a.members;
    return members.map(exports.value2JS);
})
    .caseOf(facets_parser_1.Node.Literal, function (_a) {
    var value = _a.value;
    return value;
})
    .end(); };
/**
 * ast2Vertex converts an AST into a graph of verticies starting at the root node.
 */
exports.ast2Vertex = function (ctx) { return function (policies) { return function (n) {
    return match_1.match(n)
        .caseOf(facets_parser_1.Node.Conditions, parseRoot(ctx)(policies))
        .caseOf(facets_parser_1.Node.Filter, parseFilter(ctx)(policies))
        .caseOf(facets_parser_1.Node.And, parseAndOr(ctx)(policies))
        .caseOf(facets_parser_1.Node.Or, parseAndOr(ctx)(policies))
        .orElse(function () { return Either_1.Either.left({ message: "Unsupported node type " + n.type + "!" }); })
        .end();
}; }; };
var parseRoot = function (ctx) { return function (policies) { return function (n) {
    return Maybe_1.Maybe
        .fromAny(n.conditions)
        .map(function (c) {
        return exports.ensureFilterLimit(c, ctx.options.maxFilters)
            .chain(function (c) { return exports.ast2Vertex(ctx)(policies)(c); });
    })
        .orJust(function () { return Either_1.right(ctx.empty()); })
        .get();
}; }; };
var parseAndOr = function (ctx) { return function (policies) { return function (n) {
    return (exports.ast2Vertex(ctx)(policies)(n.left))
        .chain(function (lv) {
        return (exports.ast2Vertex(ctx)(policies)(n.right))
            .map(function (rv) { return match_1.match(n)
            .caseOf(facets_parser_1.Node.And, function () { return ctx.and(ctx)(lv)(rv); })
            .caseOf(facets_parser_1.Node.Or, function () { return ctx.or(ctx)(lv)(rv); })
            .end(); });
    });
}; }; };
var parseFilter = function (ctx) { return function (policies) { return function (_a) {
    var field = _a.field, operator = _a.operator, value = _a.value;
    return Maybe_1.Maybe
        .fromAny(exports.value2JS(value))
        .chain(function (value) {
        return Maybe_1.Maybe
            .fromAny(policies[field])
            .chain(resolvePolicy(ctx.policies))
            .map(function (p) {
            return !checkType(p.type, value) ?
                Either_1.left(invalidFilterType({ field: field, operator: operator, value: value }, p.type)) :
                (operator === 'default') ?
                    Either_1.right((p.vertex(ctx)({ field: field, operator: p.operators[0], value: value }))) :
                    (p.operators.indexOf(operator) > -1) ?
                        Either_1.right(p.vertex(ctx)({ field: field, operator: operator, value: value })) :
                        Either_1.left(invalidFilterOperatorErr({ field: field, operator: operator, value: value }));
        })
            .orJust(function () { return Either_1.left(invalidFilterFieldErr({ field: field, operator: operator, value: value })); });
    })
        .get();
}; }; };
var resolvePolicy = function (available) { return function (specified) {
    return Maybe_1.Maybe
        .fromBoolean((typeof specified === 'string'))
        .chain(function () { return Maybe_1.Maybe.fromAny(available[specified]); })
        .orJust(function () { return specified; });
}; };
/**
 * convert source text to a Vertex.
 */
exports.convert = function (ctx) { return function (policies) { return function (source) {
    try {
        return (exports.ast2Vertex(ctx)(policies)(facets_parser_1.parse(source)));
    }
    catch (e) {
        return Either_1.Either.left({ message: e.message });
    }
}; }; };
/**
 * compile a string into a usable string of filters.
 */
exports.compile = function (ctx) { return function (policies) { return function (source) {
    return (exports.convert(ctx)(policies)(source))
        .chain(function (v) { return v.compile(); });
}; }; };
//# sourceMappingURL=index.js.map