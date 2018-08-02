import { Either } from 'afpl/lib/monad/Either';
import { PolicyMap, Policies, Context, Term, Options, TermConsMap, FilterSpec, Err } from '@quenk/facets-dsl';
import { Comparison } from './Comparison';
import { And } from './And';
import { Empty } from './Empty';
import { Like } from './Like';
import { Or } from './Or';
import { Operator } from './Operator';
export { Options, Comparison, And, Empty, Like, Or, Operator };
/**
 * SQL code.
 */
export declare type SQL = string;
/**
 * SQLPolicies
 */
export declare type SQLPolicies = Policies<SQL>;
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
/**
 * defaultTerms for supporting the DSL.
 */
export declare const defaultTerms: TermConsMap<SQL>;
/**
 * defaultPolicies that can be specified as strings instead of maps.
 */
export declare const defaultPolicies: PolicyMap<string>;
/**
 * defaultOptions used during compilation.
 */
export declare const defaultOptions: {
    maxFilters: number;
};
/**
 * compile a source string into SQL.
 */
export declare const compile: (options: Options) => (p: Policies<string>) => (source: string) => Either<Err, string>;
/**
 * compileE compiles to SQL with user supplied values replaced by '?'.
 *
 * The actual values are fed into the provided array.
 */
export declare const compileE: (options: Options) => (enabled: Policies<string>) => (params: any[]) => (source: string) => Either<Err, string>;
