import { parse, Node } from '@quenk/facets-parser';
import { match } from '@quenk/match';
import { Either, left, right } from 'afpl/lib/monad/Either';
import { Maybe } from 'afpl/lib/monad/Maybe';

const FilterNode = Node.Filter;
export { FilterNode, parse };

/**
 * defaultOptions 
 */
export const defaultOptions = {

    maxFilters: 100,

};

type AndOr = Node.And | Node.Or;

/**
 * Context represents the context the compilation
 * takes place in.
 *
 * It specifies the options and functions required to complete
 * the transformation process.
 *
 */
export interface Context<F> {

    /**
     * options for compilation.
     */
    options: Options,

    /**
     * available policies that can be specified via a string
     */
    available: { [key: string]: Policy<F> }

    /**
     * empty function for empty strings.
     */
    empty: EmptyProvider<F>,

    /**
     * and function used to construct an 'and' unit.
     */
    and: AndProvider<F>,

    /**
     * or function used to construct an 'or' unit.
     */
    or: OrProvider<F>

    /**
     * policies for each field allowed.
     */
    policies: { [key: string]: string | Policy<F> }

}

/**
 * Policy provides information relating to how a filter should 
 * be treated after parsing.
 */
export interface Policy<F> {

    /**
     * type indicates what JS type the value should be.
     *
     * If the value does not match the type it is rejected.
     */
    type: string,

    /**
     * operators is a list of operators allowed.
     * The first is used as the default when 'default' is specified.
     */
    operators: Operator[],

    /**
     * vertex provides a function for constructing the field's vertex.
     */
    vertex: VertexProvider<F>

}

/**
 * Operator for the filter condition.
 */
export type Operator = string;

/**
 * Source text for parsing and compilation.
 */
export type Source = string;

/**
 * Options used during the compilation process.
 */
export interface Options {

    /**
     * maxFilters allowed to specified in the source.
     */
    maxFilters?: number

}

/**
 * VertexProvider provides the unit used to compile a filter.
 */
export type VertexProvider<F> =
    (c: Context<F>) => (filter: FilterSpec<any>) => Vertex<F>;

/**
 * FilterSpec holds information about a Filter being processed.
 */
export interface FilterSpec<V> { field: string, operator: string, value: V };

/**
 * EmptyProvider provides the empty unit.
 */
export type EmptyProvider<F> = () => Vertex<F>;

/**
 * AndProvider provides the unit for compiling 'and' expressions.
 */
export type AndProvider<F> =
    (c: Context<F>) => (left: Vertex<F>) => (right: Vertex<F>) => Vertex<F>;

/**
 * OrProvider provides the unit for compiling 'or' expressions. 
 */
export type OrProvider<F> =
    (c: Context<F>) => (left: Vertex<F>) => (right: Vertex<F>) => Vertex<F>;

/**
 * Vertex is a chain of verticies that ultimately form the filter to be 
 * used in the application.
 */
export interface Vertex<F> {

    /**
     * compile this Vertex returning it's native filter representation.
     */
    compile(): Either<Err, F>

}

/**
 * Err indicates something went wrong.
 */
export interface Err {

    /**
     * message of the error.
     */
    message: string

}

/**
 * FilterErr 
 */
export interface FilterErr<V> extends Err {

    /**
     * field the filter applies to.
     */
    field: string,

    /**
     * operator used.
     */
    operator: string,

    /**
     * value used.
     */
    value: V

}

/**
 * maxFilterExceededErr indicates the maximum amount of filters allowed
 * has been surpassed.
 */
export const maxFilterExceededErr = (n: number, max: number) =>
    ({ n, max, message: `Max ${max} filters are allowed, got ${n}!` });

/**
 * invalidFilterFieldErr invalid indicates the filter supplied is not supported.
 */
const invalidFilterFieldErr = <V>({ field, operator, value }: FilterSpec<V>) =>
    ({ field, operator, value, message: `Invalid field ${field}!` });

/**
 * invalidFilterOperatorErr indicates an invalid operator was supplied.
 */
const invalidFilterOperatorErr = <V>({ field, operator, value }: FilterSpec<V>) =>
    ({ field, operator, value, message: `Invalid operator '${operator}' used with field '${field}'!` });

/**
 * invalidFilterType indicates the value used with the filter is the incorrect type.
 */
const invalidFilterType = <V>({ field, operator, value }: FilterSpec<V>, typ: string) =>
    ({
        field,
        operator,
        value,
        message: `Invalid type '${typeof value}' for field '${field}', expected type of '${typ}'!`
    });

/**
 * checkType to ensure they match.
 */
const checkType = <V>(typ: string, value: V): boolean =>
    (Array.isArray(value) && typ === 'array') ? true :
        (typeof value === typ) ? true : false

/**
 * count the number of filters in the AST.
 */
export const count = (n: Node.Node): number => match<number>(n)
    .caseOf(Node.And, (n: Node.And) => count(n.left) + count(n.right))
    .caseOf(Node.Or, (n: Node.Or) => count(n.left) + count(n.right))
    .caseOf(Node.Filter, () => 1)
    .orElse(() => 0)
    .end();

/**
 * ensureFilterLimit prevents abuse via excessively long queries.
 */
export const ensureFilterLimit = (n: Node.Condition, max: number)
    : Either<Err, Node.Condition> =>
    (max <= 0) ?
        Either
            .right<Err, Node.Condition>(n) :
        Either
            .right<Err, number>(count(n))
            .chain(c => (c > max) ?
                Either
                    .left<Err, Node.Condition>(maxFilterExceededErr(c, max)) :
                Either
                    .right<Err, Node.Condition>(n));
/**
 * value2JS converts a parseed value node into a JS value.
 */
export const value2JS = <J>(v: Node.Value): J => match(v)
    .caseOf(Node.List, ({ members }: Node.List) => members.map(value2JS))
    .caseOf(Node.Literal, ({ value }: Node.Literal) => value)
    .end();

/**
 * ast2Vertex converts an AST into a graph of verticies starting at the root node.
 */
export const ast2Vertex = <F>(ctx: Context<F>) => (n: Node.Node): Either<Err, Vertex<F>> =>
    match<Either<Err, Vertex<F>>>(n)
        .caseOf(Node.Conditions, parseRoot<F>(ctx))
        .caseOf(Node.Filter, parseFilter<F>(ctx))
        .caseOf(Node.And, parseAndOr<F>(ctx))
        .caseOf(Node.Or, parseAndOr<F>(ctx))
        .orElse(() => Either.left<Err, Vertex<F>>({ message: `Unsupported node type ${n.type}!` }))
        .end();

const parseRoot = <F>(ctx: Context<F>) => (n: Node.Conditions) =>
    Maybe
        .fromAny(n.conditions)
        .map((c: Node.Condition) =>
            ensureFilterLimit(c, ctx.options.maxFilters)
                .chain(c => ast2Vertex<F>(ctx)(c)))
        .orJust(() => right<Err, Vertex<F>>(ctx.empty()))
        .get();

const parseAndOr = <F>(ctx: Context<F>) => (n: AndOr): Either<Err, Vertex<F>> =>
    (ast2Vertex<F>(ctx)(n.left))
        .chain(lv =>
            (ast2Vertex<F>(ctx)(n.right))
                .map(rv => match<Vertex<F>>(n)
                    .caseOf(Node.And, () => ctx.and(ctx)(lv)(rv))
                    .caseOf(Node.Or, () => ctx.or(ctx)(lv)(rv))
                    .end()));

const parseFilter = <F>(ctx: Context<F>) => ({ field, operator, value }: Node.Filter)
    : Either<Err, Vertex<F>> =>
    Maybe
        .fromAny(value2JS(value))
        .chain((value: F) =>
            Maybe
                .fromAny(ctx.policies[field])
                .chain((p: string | Policy<F>) => (typeof p === 'string') ?
                    Maybe.fromAny(ctx.available[p]) :
                    Maybe.fromAny(p))
                .map((p: Policy<F>): Either<Err, Vertex<F>> =>
                    !checkType(p.type, value) ?
                        left<Err, Vertex<F>>(invalidFilterType({ field, operator, value }, p.type)) :
                        (operator === 'default') ?
                            right<Err, Vertex<F>>((p.vertex(ctx)({ field, operator: p.operators[0], value }))) :
                            (p.operators.indexOf(operator) > -1) ?
                                right<Err, Vertex<F>>(p.vertex(ctx)({ field, operator, value })) :
                                left<Err, Vertex<F>>(invalidFilterOperatorErr<F>({ field, operator, value })))
                .orJust(() => left<Err, Vertex<F>>(invalidFilterFieldErr<F>({ field, operator, value }))))
        .get();

/**
 * convert source text to a Vertex.
 */
export const convert = <F>(ctx: Context<F>) => (source: Source): Either<Err, Vertex<F>> => {

    try {

        return (ast2Vertex<F>(ctx)(parse(source)));

    } catch (e) {

        return Either.left<Err, Vertex<F>>({ message: e.message });

    }

}

/**
 * compile a string into a usable string of filters.
 */
export const compile = <F>(ctx: Context<F>) => (source: Source): Either<Err, F> =>
    (convert(ctx)(source)).chain((v: Vertex<F>) => v.compile());
