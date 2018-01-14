import { Either } from 'afpl/lib/monad/Either';
import { SQL, FilterValue, SQLTerm } from '.';
import { Err } from '@quenk/facets-dsl';
/**
 * Comparison.
 */
export declare abstract class Comparison implements SQLTerm {
    left: SQLTerm;
    right: SQLTerm;
    constructor(left: SQLTerm, right: SQLTerm);
    abstract escape(params: FilterValue[]): Either<Err, SQL>;
    abstract compile(): Either<Err, SQL>;
}
