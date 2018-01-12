import { SQL, FilterValue, SQLVertex } from '.';
import { Either, right } from 'afpl/lib/monad/Either';
import { Err } from '../';

/**
 * Like compiles to the SQL like condition.
 */
export class Like implements SQLVertex {

    constructor(public field: string, public value: string) { }

    escape(params: FilterValue[]): Either<Err, SQL> {

        params.push(this.value);
        return right<Err, SQL>(`${this.field} LIKE CONCAT('%', ?, '%')`);

    }

    compile(): Either<Err, SQL> {

        return right<Err, SQL>(`${this.field} LIKE '%${this.value}%'`);

    }

}

