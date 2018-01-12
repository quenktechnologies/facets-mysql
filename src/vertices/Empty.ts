import { SQL, SQLVertex, FilterValue } from '.';
import { Either, right } from 'afpl/lib/monad/Either';
import { Err } from '../';

/**
 * Empty compiles to an empty string.
 */
export class Empty implements SQLVertex {

    escape(_params: FilterValue[]): Either<Err, SQL> {

        return right<Err, SQL>('');

    }

    compile(): Either<Err, SQL> {

        return right<Err, SQL>('');

    }

}

