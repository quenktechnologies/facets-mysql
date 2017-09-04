import { Node } from '@quenk/facets-parser';
import { Either, Maybe } from 'afpl';
export declare type Standard = string | Criteria;
export interface Criteria {
    cast?: Function;
    type?: string;
    pattern?: string;
    func?: (a: any) => any;
    operators?: string[];
}
export interface Policy {
    [key: string]: Standard;
}
/**
 * Options you can pass to the compiler
 */
export interface Options {
    maxFilters?: number;
    logSyntaxErrors?: boolean;
    policy?: Policy;
}
/**
 * Context of the filters being interpreted.
 */
export declare class Context {
    sql: string;
    params: any[];
    constructor(sql: string, params?: any[]);
    toString(): string;
    toSQL(): string;
}
/**
 * count the number of filters specified.
 */
export declare const count: (n: Node.Node) => number;
/**
 * ensureFilterLimit prevents abuse via excessively long queries.
 */
export declare const ensureFilterLimit: (n: Node.Condition, max: number) => Either<string, Node.Condition>;
export declare const ensureFieldIsInPolicy: (n: Node.Filter, policy: Policy) => Either<string, Node.Filter>;
export declare const applyPolicy: (value: Node.Value, n: Node.Filter, std: Standard) => Either<string, any>;
export declare const castCriteria: (value: any, typ: Maybe<Function>, _n: Node.Filter) => Either<string, any>;
/**
 * typeCriteria checks if the value is of the allowed type for the field.
 */
export declare const typeCriteria: (value: any, typ: Maybe<string>, n: Node.Filter) => Either<string, any>;
/**
 * patternCriteria requires the value to match a regular expression
 */
export declare const patternCriteria: (value: any, pattern: Maybe<string>, n: Node.Filter) => Either<string, any>;
/**
 * funcCriteria applies a function to the value before it is used
 */
export declare const funcCriteria: (value: any, func: Maybe<(a: any) => any>, _n: Node.Filter) => Either<string, any>;
/**
 * operatorCriteria ensures the operators used are correct.
 */
export declare const operatorCriteria: (value: any, operators: Maybe<string[]>, n: Node.Filter) => Either<string, any>;
/**
 * code turns an AST into Filters.
 */
export declare const code: (n: Node.Node, ctx: Context, options: Options) => Either<string, Context>;
export declare const compile: (src: string, options?: Options, ctx?: Context) => Either<string, Context>;
