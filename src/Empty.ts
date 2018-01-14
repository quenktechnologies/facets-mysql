import { SQL, SQLTerm, FilterValue } from '.';
import { Either, right } from 'afpl/lib/monad/Either';
import { Err } from '@quenk/facets-dsl';

/**
 * Empty compiles to an empty string.
 */
export class Empty implements SQLTerm {

    escape(_params: FilterValue[]): Either<Err, SQL> {

        return right<Err, SQL>('');

    }

    compile(): Either<Err, SQL> {

        return right<Err, SQL>('');

    }

}

