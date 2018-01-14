import { Comparison } from './Comparison';
import { FilterValue, SQL } from '.';
import { Either } from 'afpl/lib/monad/Either';
import { Err } from '@quenk/facets-dsl';
/**
 * Or compiles to an SQL or.
 */
export declare class Or extends Comparison {
    escape(params: FilterValue[]): Either<Err, SQL>;
    compile(): Either<Err, SQL>;
}
