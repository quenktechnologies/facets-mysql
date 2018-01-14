import { Either } from 'afpl/lib/monad/Either';
import { Policies, Context, Term, FilterSpec, Err } from '@quenk/facets-dsl';
import { Comparison } from './Comparison';
import { And } from './And';
import { Empty } from './Empty';
import { Like } from './Like';
import { Or } from './Or';
import { Operator } from './Operator';
export { Comparison };
export { And };
export { Empty };
export { Like };
export { Or };
export { Operator };
/**
 * SQL code.
 */
export declare type SQL = string;
/**
 * FilterValue is the allowed values to be used in filters
 */
export declare type FilterValue = string | number;
/**
 * SQLTerm is the interface all SQL verticies must implement to be used.
 */
export interface SQLTerm extends Term<SQL> {
    /**
     * escape provides an SQL filter string with the values parameterized with '?'.
     *
     * The actual values are placed in the passed array.
     */
    escape(params: FilterValue[]): Either<Err, SQL>;
}
/**
 * and Term provider.
 */
export declare const and: (_: Context<string>) => (left: SQLTerm) => (right: SQLTerm) => And;
/**
 * or Term provider.
 */
export declare const or: (_: Context<string>) => (left: SQLTerm) => (right: SQLTerm) => Or;
/**
 * empty Term provider.
 */
export declare const empty: () => Empty;
/**
 * like Term provider.
 */
export declare const like: (_: Context<string>) => ({field, value}: FilterSpec<string>) => Like;
/**
 * operator Term provider.
 */
export declare const operator: (_: Context<string>) => ({field, operator, value}: FilterSpec<string>) => Operator;
export declare const defaultTerms: () => {
    and: (_: Context<string>) => (left: SQLTerm) => (right: SQLTerm) => And;
    or: (_: Context<string>) => (left: SQLTerm) => (right: SQLTerm) => Or;
    empty: () => Empty;
};
export declare const defaultPolicies: Policies<string>;
export declare const defaultOptions: () => {
    maxFilters: number;
};
export declare const compile$$$: (p: Policies<string>) => (source: string) => Either<Err, string>;
