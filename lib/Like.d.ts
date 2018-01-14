import { Err } from '@quenk/facets-dsl';
import { SQL, FilterValue, SQLTerm } from '.';
import { Either } from 'afpl/lib/monad/Either';
/**
 * Like compiles to the SQL like condition.
 */
export declare class Like implements SQLTerm {
    field: string;
    value: string;
    constructor(field: string, value: string);
    escape(params: FilterValue[]): Either<Err, SQL>;
    compile(): Either<Err, SQL>;
}
