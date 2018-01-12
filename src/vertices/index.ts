import { Either } from 'afpl/lib/monad/Either';
import { Context, Vertex, FilterSpec, Err } from '../';

import { Comparison } from './Comparison';
import { And } from './And';
import { Empty } from './Empty';
import { Like } from './Like';
import { Or } from './Or';
import { Operator } from './Operator';

export { Comparison }
export { And }
export { Empty }
export { Like }
export { Or }
export { Operator }

/**
 * SQL code.
 */
export type SQL = string;

/**
 * FilterValue is the allowed values to be used in filters
 */
export type FilterValue = string | number;

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

export const and = (_: Context<string>) =>
    (left: SQLVertex) =>
        (right: SQLVertex) => new And(left, right);

export const or = (_: Context<string>) =>
    (left: SQLVertex) =>
        (right: SQLVertex) => new Or(left, right);

export const empty = () => new Empty();

export const like = (_: Context<string>) =>
    ({ field, value }: FilterSpec<string>) => new Like(field, value);

export const operator = (_: Context<string>) =>
    ({ field, operator, value }: FilterSpec<string>) =>
        new Operator(field, operator, value);

/**
 * availablePolicies for constructing filters from SQL.
 */
export const availablePolicies = {

    number: {

        type: 'number',
        operators: ['=', '>=', '>=', '<=', '>=', '<'],
        vertex: operator

    },
    string: {

        type: 'string',
        operators: ['='],
        vertex: like

    }

};


