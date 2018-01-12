import { Comparison } from './Comparison';
import { SQL, FilterValue } from '.';
import { Either } from 'afpl/lib/monad/Either';
import { Err } from '../';
/**
 * And compiles to an SQL and.
 */
export declare class And extends Comparison {
    escape(params: FilterValue[]): Either<Err, SQL>;
    compile(): Either<Err, SQL>;
}
