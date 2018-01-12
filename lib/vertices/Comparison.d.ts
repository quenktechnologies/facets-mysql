import { Either } from 'afpl/lib/monad/Either';
import { SQL, FilterValue, SQLVertex } from '.';
import { Err } from '../';
/**
 * Comparison.
 */
export declare abstract class Comparison implements SQLVertex {
    left: SQLVertex;
    right: SQLVertex;
    constructor(left: SQLVertex, right: SQLVertex);
    abstract escape(params: FilterValue[]): Either<Err, SQL>;
    abstract compile(): Either<Err, SQL>;
}
