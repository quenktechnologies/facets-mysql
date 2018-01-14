import { SQL, SQLTerm, FilterValue } from '.';
import { Either } from 'afpl/lib/monad/Either';
import { Err } from '@quenk/facets-dsl';
/**
 * Empty compiles to an empty string.
 */
export declare class Empty implements SQLTerm {
    escape(_params: FilterValue[]): Either<Err, SQL>;
    compile(): Either<Err, SQL>;
}
