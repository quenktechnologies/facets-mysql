import { Comparison } from './Comparison';
import { SQL, FilterValue } from '.';
import { Either } from 'afpl/lib/monad/Either';
import { Err } from '../';

/**
 * And compiles to an SQL and.
 */
export class And extends Comparison {

    escape(params: FilterValue[]): Either<Err, SQL> {

        return this
            .left
            .escape(params)
            .chain(l =>
                this
                    .right
                    .escape(params)
                    .map(r => `(${l}) AND (${r})`));

    }

    compile(): Either<Err, SQL> {

        return this
            .left
            .compile()
            .chain(l =>
                this
                    .right
                    .compile()
                    .map(r => `(${l}) AND (${r})`));

    }

}

