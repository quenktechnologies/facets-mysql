import { Comparison } from './Comparison';
import { FilterValue, SQL } from '.';
import { Either } from 'afpl/lib/monad/Either';
import { Err } from '../';

/**
 * Or compiles to an SQL or.
 */
export class Or extends Comparison {

    escape(params: FilterValue[]): Either<Err, SQL> {

        return this
            .left
            .escape(params)
            .chain(l =>
                this
                    .right
                    .escape(params)
                    .map(r => `(${l}) OR (${r})`));

    }

    compile(): Either<Err, SQL> {

        return this
            .left
            .compile()
            .chain(l =>
                this
                    .right
                    .compile()
                    .map(r => `(${l}) OR (${r})`));

    }

}
