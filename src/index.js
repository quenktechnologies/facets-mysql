"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var facets_parser_1 = require("@quenk/facets-parser");
var afpl_1 = require("afpl");
var SQLString = require("sqlstring");
var defaultCriteria = {
    string: {
        type: 'string'
    },
    number: {
        type: 'number'
    },
    boolean: {
        type: 'boolean'
    }
};
var _op = function (field, op, value) {
    return field + " " + op + " " + value;
};
var operators = {
    '>': _op,
    '<': _op,
    '>=': _op,
    '<=': _op,
    '=': _op,
    '!=': _op,
    '%': function (field, _op, value) { return field + " LIKE " + value; }
};
/**
 * Context of the filters being interpreted.
 */
var Context = /** @class */ (function () {
    function Context(sql, params) {
        if (params === void 0) { params = []; }
        this.sql = sql;
        this.params = params;
    }
    Context.prototype.toString = function () {
        return this.sql;
    };
    Context.prototype.toSQL = function () {
        return SQLString.format(this.sql, this.params);
    };
    return Context;
}());
exports.Context = Context;
/**
 * count the number of filters specified.
 */
exports.count = function (n) {
    if ((n instanceof facets_parser_1.Node.And) || (n instanceof facets_parser_1.Node.Or))
        return exports.count(n.left) + exports.count(n.right);
    else if (n instanceof facets_parser_1.Node.Filter)
        return 1;
    else
        return 0;
};
/**
 * ensureFilterLimit prevents abuse via excessively long queries.
 */
exports.ensureFilterLimit = function (n, max) {
    if (max <= 0)
        return afpl_1.Either.right(n);
    var c = exports.count(n);
    if (c > max)
        return afpl_1.Either.left("Too many filters specified " +
            ("max:" + max + " received: " + c));
    else
        return afpl_1.Either.right(n);
};
exports.ensureFieldIsInPolicy = function (n, policy) {
    if (!policy.hasOwnProperty(n.field))
        return afpl_1.Either.left("Unknown column name '" + n.field + "'!");
    else
        return afpl_1.Either.right(n);
};
exports.applyPolicy = function (value, n, std) {
    var criteria = (typeof std === 'string') ? defaultCriteria[std] : std;
    if (value instanceof facets_parser_1.Node.List) {
        return afpl_1.Either.left('List queries not yet supported!');
    }
    else if (value instanceof facets_parser_1.Node.Literal) {
        return exports.castCriteria(value.value, afpl_1.Maybe.fromAny(criteria.cast), n)
            .chain(function (v) { return exports.typeCriteria(v, afpl_1.Maybe.fromAny(criteria.type), n); })
            .chain(function (v) { return exports.patternCriteria(v, afpl_1.Maybe.fromAny(criteria.pattern), n); })
            .chain(function (v) { return exports.funcCriteria(v, afpl_1.Maybe.fromAny(criteria.func), n); })
            .chain(function (v) { return exports.operatorCriteria(v, afpl_1.Maybe.fromAny(criteria.operators), n); });
    }
    else {
        return afpl_1.Either.left('this is probably a bug, looks like we have a phantom value');
    }
};
exports.castCriteria = function (value, typ, _n) {
    return typ.cata(function () { return afpl_1.Either.right(value); }, function (f) { return afpl_1.Either.right(f(value)); });
};
/**
 * typeCriteria checks if the value is of the allowed type for the field.
 */
exports.typeCriteria = function (value, typ, n) {
    return typ.cata(function () { return afpl_1.Either.right(value); }, function (typ) { return (typ !== typeof value) ?
        afpl_1.Either.left(n.field + " must be type " +
            ("'" + typ + "' got '" + typeof value + "'")) :
        afpl_1.Either.right(value); });
};
/**
 * patternCriteria requires the value to match a regular expression
 */
exports.patternCriteria = function (value, pattern, n) {
    return pattern.cata(function () { return afpl_1.Either.right(value); }, function (pattern) { return (!(new RegExp(pattern)).test(value)) ?
        afpl_1.Either.left(n.field + " does not match the pattern " + pattern + "!") :
        afpl_1.Either.right(value); });
};
/**
 * funcCriteria applies a function to the value before it is used
 */
exports.funcCriteria = function (value, func, _n) {
    return func.cata(function () { return afpl_1.Either.right(value); }, function (f) { return afpl_1.Either.right(f(value)); });
};
/**
 * operatorCriteria ensures the operators used are correct.
 */
exports.operatorCriteria = function (value, operators, n) {
    return operators.cata(function () { return afpl_1.Either.right(value); }, function (ops) {
        return (ops.indexOf(n.operator) < 0) ?
            afpl_1.Either.left(n.field + " only allows the following operators " +
                ("\"" + ops.join() + "\"!")) :
            afpl_1.Either.right(value);
    });
};
var Result = /** @class */ (function () {
    function Result(sql, context) {
        this.sql = sql;
        this.context = context;
    }
    return Result;
}());
exports.Result = Result;
/**
 * code turns an AST into Filters.
 */
exports.code = function (n, ctx, options) {
    if (n instanceof facets_parser_1.Node.Conditions) {
        return (n.conditions == null) ?
            afpl_1.Either.right(ctx) :
            exports.ensureFilterLimit(n.conditions, options.maxFilters)
                .chain(function (con) { return exports.code(con, ctx, options); });
    }
    else if ((n instanceof facets_parser_1.Node.And) || (n instanceof facets_parser_1.Node.Or)) {
        var op_1 = (n instanceof facets_parser_1.Node.And) ? 'AND' : 'OR';
        return exports.code(n.left, new Context('', ctx.params), options)
            .chain(function (l) {
            return exports.code(n.right, new Context('', l.params), options)
                .map(function (r) { return new Context(ctx.sql + " " + l.sql + " " + op_1 + " " + r.sql, r.params); });
        });
    }
    else if (n instanceof facets_parser_1.Node.Filter) {
        return exports.ensureFieldIsInPolicy(n, options.policy)
            .chain(function (n) {
            return exports.applyPolicy(n.value, n, options.policy[n.field])
                .map(function (value) {
                return new Context(ctx.sql + " " + operators[n.operator](SQLString.escapeId(n.field), n.operator, '?'), ctx.params.concat(value));
            });
        });
    }
    else {
        return afpl_1.Either.left("Unsupported type " + n.type + "!");
    }
};
var defaultOptions = {
    maxFilters: 100,
    policy: {}
};
exports.compile = function (src, options, ctx) {
    if (options === void 0) { options = {}; }
    if (ctx === void 0) { ctx = new Context('', []); }
    try {
        return exports.code(facets_parser_1.parse(src), ctx, afpl_1.util.fuse(defaultOptions, options));
    }
    catch (e) {
        return afpl_1.Either.left("Invalid Syntax");
    }
};
//# sourceMappingURL=index.js.map