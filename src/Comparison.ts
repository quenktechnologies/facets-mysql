import { Either } from 'afpl/lib/monad/Either';
import { SQL, FilterValue, SQLTerm } from '.';
import { Err } from '@quenk/facets-dsl';

/**
 * Comparison.
 */
export abstract class Comparison implements SQLTerm {

    constructor(public left: SQLTerm, public right: SQLTerm) { }

    abstract escape(params: FilterValue[]): Either<Err, SQL>;

    abstract compile(): Either<Err, SQL>;

}
