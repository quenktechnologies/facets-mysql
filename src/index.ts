import { Either } from 'afpl/lib/monad/Either';
import {
    PolicyMap,
    Policies,
    Context,
    Term,
    Options,
    Source,
    FilterSpec,
    Err,
    compile as _compile,
    source2Term
} from '@quenk/facets-dsl';
import { Comparison } from './Comparison';
import { And } from './And';
import { Empty } from './Empty';
import { Like } from './Like';
import { Or } from './Or';
import { Operator } from './Operator';

export { Options, Comparison, And, Empty, Like, Or, Operator }

/**
 * SQL code.
 */
export type SQL = string;

/**
 * SQLPolicies 
 */
export type SQLPolicies = Policies<SQL>;

/**
 * FilterValue is the allowed values to be used in filters
 */
export type FilterValue = string | number;

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
export const and = (_: Context<string>) =>
    (left: SQLTerm) =>
        (right: SQLTerm) => new And(left, right);

/**
 * or Term provider.
 */
export const or = (_: Context<string>) =>
    (left: SQLTerm) =>
        (right: SQLTerm) => new Or(left, right);

/**
 * empty Term provider.
 */
export const empty = () => new Empty();

/**
 * like Term provider.
 */
export const like = (_: Context<string>) =>
    ({ field, value }: FilterSpec<string>) => new Like(field, value);

/**
 * operator Term provider.
 */
export const operator = (_: Context<string>) =>
    ({ field, operator, value }: FilterSpec<string>) =>
        new Operator(field, operator, value);

/**
 * defaultTerms for supporting the DSL.
 */
export const defaultTerms = {
    and: and,
    or: or,
    empty: empty
};

/**
 * defaultPolicies that can be specified as strings instead of maps.
 */
export const defaultPolicies: PolicyMap<string> = {

    number: {

        type: 'number',
        operators: ['=', '>=', '>=', '<=', '>=', '<'],
        term: operator

    },
    string: {

        type: 'string',
        operators: ['='],
        term: like

    }

};

/**
 * defaultOptions used during compilation.
 */
export const defaultOptions = {

    maxFilters: 100

};

/**
 * compile a source string into SQL.
 */
export const compile = _compile(defaultTerms)(defaultPolicies);

/**
 * compileE compiles to SQL with user supplied values replaced by '?'.
 * 
 * The actual values are fed into the provided array.
 */
export const compileE = (options: Options) => (enabled: SQLPolicies) =>
    (params: any[]) => (source: Source): Either<Err, SQL> =>
        (source2Term({
            terms: defaultTerms,
            policies: defaultPolicies,
            options
        })(enabled)(source))            .chain((t: SQLTerm) => t.escape(params));

