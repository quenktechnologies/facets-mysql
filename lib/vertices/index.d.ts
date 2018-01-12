import { Either } from 'afpl/lib/monad/Either';
import { Context, Vertex, FilterSpec, Err } from '../';
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
 *
 * SQLVertex is the interface all SQL verticies must implement to be used.
 */
export interface SQLVertex extends Vertex<SQL> {
    /**
     * escape provides an SQL filter string with the values parameterized with '?'.
     *
     * The actual values are placed in the passed array.
     */
    escape(params: FilterValue[]): Either<Err, SQL>;
}
export declare const and: (_: Context<string>) => (left: SQLVertex) => (right: SQLVertex) => And;
export declare const or: (_: Context<string>) => (left: SQLVertex) => (right: SQLVertex) => Or;
export declare const empty: () => Empty;
export declare const like: (_: Context<string>) => ({field, value}: FilterSpec<string>) => Like;
export declare const operator: (_: Context<string>) => ({field, operator, value}: FilterSpec<string>) => Operator;
/**
 * availablePolicies for constructing filters from SQL.
 */
export declare const availablePolicies: {
    number: {
        type: string;
        operators: string[];
        vertex: (_: Context<string>) => ({field, operator, value}: FilterSpec<string>) => Operator;
    };
    string: {
        type: string;
        operators: string[];
        vertex: (_: Context<string>) => ({field, value}: FilterSpec<string>) => Like;
    };
};
