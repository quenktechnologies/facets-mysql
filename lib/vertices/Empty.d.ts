import { SQL, SQLVertex, FilterValue } from '.';
import { Either } from 'afpl/lib/monad/Either';
import { Err } from '../';
/**
 * Empty compiles to an empty string.
 */
export declare class Empty implements SQLVertex {
    escape(_params: FilterValue[]): Either<Err, SQL>;
    compile(): Either<Err, SQL>;
}
