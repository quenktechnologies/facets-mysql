import { Either } from 'afpl/lib/monad/Either';
import { SQL, FilterValue, SQLVertex } from '.';
import { Err } from '../';

/**
 * Comparison.
 */
export abstract class Comparison implements SQLVertex {

    constructor(public left: SQLVertex, public right: SQLVertex) { }

    abstract escape(params: FilterValue[]): Either<Err, SQL>;

    abstract compile(): Either<Err, SQL>;

}
