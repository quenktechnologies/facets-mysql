import * as SQLString from 'sqlstring';
import { SQL, SQLVertex, FilterValue } from '.';
import { Either, right } from 'afpl/lib/monad/Either';
import { Err } from '../';

/**
 * Operator compiles to the supported SQL comparison.
 */
export class Operator implements SQLVertex {

    constructor(public field: string, public operator: string, public value: string | number) { }

    escape(params: FilterValue[]): Either<Err,SQL> {

        params.push(this.value);
        return right<Err,SQL>(`${SQLString.escapeId(this.field)} ${this.operator} ?`);

    }

    compile(): Either<Err, SQL>{

        return right<Err,SQL>(`${this.field} ${this.operator} ${this.value}`);

    }

}
