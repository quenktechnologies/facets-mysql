import { SQL, SQLTerm, FilterValue } from '.';
import { Either } from 'afpl/lib/monad/Either';
import { Err } from '@quenk/facets-dsl';
/**
 * Operator compiles to the supported SQL comparison.
 */
export declare class Operator implements SQLTerm {
    field: string;
    operator: string;
    value: string | number;
    constructor(field: string, operator: string, value: string | number);
    escape(params: FilterValue[]): Either<Err, SQL>;
    compile(): Either<Err, SQL>;
}
