import { parse, Node } from '@quenk/facets-parser';
import { Either } from 'afpl/lib/monad/Either';
declare const FilterNode: typeof Node.Filter;
export { FilterNode, parse };
/**
 * defaultOptions
 */
export declare const defaultOptions: {
    maxFilters: number;
};
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
    options: Options;
    /**
     * available policies that can be specified via a string
     */
    available: {
        [key: string]: Policy<F>;
    };
    /**
     * empty function for empty strings.
     */
    empty: EmptyProvider<F>;
    /**
     * and function used to construct an 'and' unit.
     */
    and: AndProvider<F>;
    /**
     * or function used to construct an 'or' unit.
     */
    or: OrProvider<F>;
    /**
     * policies for each field allowed.
     */
    policies: {
        [key: string]: string | Policy<F>;
    };
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
    type: string;
    /**
     * operators is a list of operators allowed.
     * The first is used as the default when 'default' is specified.
     */
    operators: Operator[];
    /**
     * vertex provides a function for constructing the field's vertex.
     */
    vertex: VertexProvider<F>;
}
/**
 * Operator for the filter condition.
 */
export declare type Operator = string;
/**
 * Source text for parsing and compilation.
 */
export declare type Source = string;
/**
 * Options used during the compilation process.
 */
export interface Options {
    /**
     * maxFilters allowed to specified in the source.
     */
    maxFilters?: number;
}
/**
 * VertexProvider provides the unit used to compile a filter.
 */
export declare type VertexProvider<F> = (c: Context<F>) => (filter: FilterSpec<any>) => Vertex<F>;
/**
 * FilterSpec holds information about a Filter being processed.
 */
export interface FilterSpec<V> {
    field: string;
    operator: string;
    value: V;
}
/**
 * EmptyProvider provides the empty unit.
 */
export declare type EmptyProvider<F> = () => Vertex<F>;
/**
 * AndProvider provides the unit for compiling 'and' expressions.
 */
export declare type AndProvider<F> = (c: Context<F>) => (left: Vertex<F>) => (right: Vertex<F>) => Vertex<F>;
/**
 * OrProvider provides the unit for compiling 'or' expressions.
 */
export declare type OrProvider<F> = (c: Context<F>) => (left: Vertex<F>) => (right: Vertex<F>) => Vertex<F>;
/**
 * Vertex is a chain of verticies that ultimately form the filter to be
 * used in the application.
 */
export interface Vertex<F> {
    /**
     * compile this Vertex returning it's native filter representation.
     */
    compile(): Either<Err, F>;
}
/**
 * Err indicates something went wrong.
 */
export interface Err {
    /**
     * message of the error.
     */
    message: string;
}
/**
 * FilterErr
 */
export interface FilterErr<V> extends Err {
    /**
     * field the filter applies to.
     */
    field: string;
    /**
     * operator used.
     */
    operator: string;
    /**
     * value used.
     */
    value: V;
}
/**
 * maxFilterExceededErr indicates the maximum amount of filters allowed
 * has been surpassed.
 */
export declare const maxFilterExceededErr: (n: number, max: number) => {
    n: number;
    max: number;
    message: string;
};
/**
 * count the number of filters in the AST.
 */
export declare const count: (n: Node.Node) => number;
/**
 * ensureFilterLimit prevents abuse via excessively long queries.
 */
export declare const ensureFilterLimit: (n: Node.Condition, max: number) => Either<Err, Node.Condition>;
/**
 * value2JS converts a parseed value node into a JS value.
 */
export declare const value2JS: <J>(v: Node.Value) => J;
/**
 * ast2Vertex converts an AST into a graph of verticies starting at the root node.
 */
export declare const ast2Vertex: <F>(ctx: Context<F>) => (n: Node.Node) => Either<Err, Vertex<F>>;
/**
 * convert source text to a Vertex.
 */
export declare const convert: <F>(ctx: Context<F>) => (source: string) => Either<Err, Vertex<F>>;
/**
 * compile a string into a usable string of filters.
 */
export declare const compile: <F>(ctx: Context<F>) => (source: string) => Either<Err, F>;
