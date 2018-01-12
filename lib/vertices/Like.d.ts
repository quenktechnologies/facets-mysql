import { SQL, FilterValue, SQLVertex } from '.';
import { Either } from 'afpl/lib/monad/Either';
import { Err } from '../';
/**
 * Like compiles to the SQL like condition.
 */
export declare class Like implements SQLVertex {
    field: string;
    value: string;
    constructor(field: string, value: string);
    escape(params: FilterValue[]): Either<Err, SQL>;
    compile(): Either<Err, SQL>;
}
