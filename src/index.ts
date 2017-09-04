import { parse, Node } from '@quenk/facets-parser';
import { Either, Maybe, util } from 'afpl';
import * as SQLString from 'sqlstring';

export type Standard
    = string
    | Criteria
    ;

export interface Criteria {

    cast?: Function,
    type?: string,
    pattern?: string,
    func?: (a: any) => any,
    operators?: string[]

}

export interface Policy {

    [key: string]: Standard

}

/**
 * Options you can pass to the compiler
 */
export interface Options {

    maxFilters?: number
    policy?: Policy

}

const defaultCriteria: { [key: string]: Criteria } = {

    string: {

        type: 'string'

    },
    number: {

        type: 'number'

    },
    boolean: {

        type: 'boolean'

    }
}

const _op = (field: string, op: string, value: any) =>
    `${field} ${op} ${value}`;

const operators: { [key: string]: (f: string, o: string, v: any) => string } = {

    '>': _op,
    '<': _op,
    '>=': _op,
    '<=': _op,
    '=': _op,
    '!=': _op,
    '%': (field: string, _op: string, value: any) => `${field} LIKE ${value}`

}

/**
 * Context of the filters being interpreted.
 */
export class Context {

    constructor(public sql: string, public params: any[] = []) { }

    toString() {

        return this.sql;

    }

    toSQL() {

        return SQLString.format(this.sql, this.params);

    }

}

/**
 * count the number of filters specified.
 */
export const count = (n: Node.Node): number => {

    if ((n instanceof Node.And) || (n instanceof Node.Or))
        return count(n.left) + count(n.right)
    else if (n instanceof Node.Filter)
        return 1
    else
        return 0

}

/**
 * ensureFilterLimit prevents abuse via excessively long queries.
 */
export const ensureFilterLimit = (n: Node.Condition, max: number)
    : Either<string, Node.Condition> => {

    if (max <= 0)
        return Either.right<string, Node.Condition>(n);

    let c = count(n);

    if (c > max)
        return Either.left<string, Node.Condition>(`Too many filters specified ` +
            `max:${max} received: ${c}`);
    else
        return Either.right<string, Node.Condition>(n);

}

export const ensureFieldIsInPolicy = (n: Node.Filter, policy: Policy): Either<string, Node.Filter> => {

    if (!policy.hasOwnProperty(n.field))
        return Either.left<string, Node.Filter>(`Unknown column name '${n.field}'!`);
    else
        return Either.right<string, Node.Filter>(n);

}

export const applyPolicy = (value: Node.Value, n: Node.Filter, std: Standard): Either<string, any> => {

    let criteria = (typeof std === 'string') ? defaultCriteria[std] : std;

    if (value instanceof Node.List) {

        return Either.left<string, any>('List queries not yet supported!');

    } else if (value instanceof Node.Literal) {

        return castCriteria(value.value, Maybe.fromAny(criteria.cast), n)
            .chain(v => typeCriteria(v, Maybe.fromAny(criteria.type), n))
            .chain(v => patternCriteria(v, Maybe.fromAny(criteria.pattern), n))
            .chain(v => funcCriteria(v, Maybe.fromAny(criteria.func), n))
            .chain(v => operatorCriteria(v, Maybe.fromAny(criteria.operators), n))

    } else {

        return Either.left('this is probably a bug, looks like we have a phantom value');

    }

}

export const castCriteria = (value: any, typ: Maybe<Function>, _n: Node.Filter)
    : Either<string, any> =>
    typ.cata<Either<string, any>>(
        () => Either.right<string, any>(value),
        f => Either.right<string, any>(f(value)));

/**
 * typeCriteria checks if the value is of the allowed type for the field.
 */
export const typeCriteria = (value: any, typ: Maybe<string>, n: Node.Filter)
    : Either<string, any> =>
    typ.cata<Either<string, any>>(
        () => Either.right<string, any>(value),
        typ => (typ !== typeof value) ?
            Either.left<string, any>(`${n.field} must be type ` +
                `'${typ}' got '${typeof value}'`) :
            Either.right<string, any>(value));
/**
 * patternCriteria requires the value to match a regular expression
 */
export const patternCriteria = (value: any, pattern: Maybe<string>, n: Node.Filter)
    : Either<string, any> =>
    pattern.cata<Either<string, any>>(
        () => Either.right<string, any>(value),
        pattern => (!(new RegExp(pattern)).test(value)) ?
            Either.left<string, any>(`${n.field} does not match the pattern ${pattern}!`) :
            Either.right<string, any>(value));

/**
 * funcCriteria applies a function to the value before it is used
 */
export const funcCriteria = (value: any, func: Maybe<(a: any) => any>, _n: Node.Filter)
    : Either<string, any> =>
    func.cata<Either<string, any>>(
        () => Either.right<string, any>(value),
        f => Either.right<string, any>(f(value)));

/**
 * operatorCriteria ensures the operators used are correct.
 */
export const operatorCriteria = (value: any, operators: Maybe<string[]>, n: Node.Filter)
    : Either<string, any> =>
    operators.cata<Either<string, any>>(
        () => Either.right<string, any>(value),
        ops =>
            (ops.indexOf(n.operator) < 0) ?
                Either.left<string, any>(`${n.field} only allows the following operators ` +
                    `"${ops.join()}"!`) :
                Either.right<string, any>(value));

/**
 * code turns an AST into Filters.
 */
export const code = (n: Node.Node, ctx: Context, options: Options): Either<string, Context> => {

    if (n instanceof Node.Conditions) {

        return (n.conditions == null) ?
            Either.right<string, Context>(ctx) :
            ensureFilterLimit(n.conditions, options.maxFilters)
                .chain(con => code(con, new Context(`${ctx.sql} WHERE`, ctx.params), options))

    } else if ((n instanceof Node.And) || (n instanceof Node.Or)) {

        let op = (n instanceof Node.And) ? 'AND' : 'OR';

        return code(n.left, new Context('', ctx.params), options)
            .chain(l =>
                code(n.right, new Context('', l.params), options)
                    .map(r => new Context(`${ctx.sql} ${l.sql} ${op} ${r.sql}`, r.params)));

    } else if (n instanceof Node.Filter) {

        return ensureFieldIsInPolicy(n, options.policy)
            .chain(n =>
                applyPolicy(n.value, n, options.policy[n.field])
                    .map(value =>
                        new Context(
                            `${ctx.sql} ${operators[n.operator](SQLString.escapeId(n.field), n.operator, '?')}`,
                            ctx.params.concat(value))))
    } else {

        return Either.left<string, Context>(`Unsupported type ${n.type}!`);

    }

}

const defaultOptions: Options = {

    maxFilters: 100,
    policy: {}

};

export const compile = (src: string,
    options: Options = {},
    ctx: Context = new Context('', [])): Either<string, Context> => {

    try {
        return code(parse(src), ctx, util.fuse(defaultOptions, options))
    } catch (e) {

        return Either.left<string, Context>(`Invalid Syntax`);

    }

}

