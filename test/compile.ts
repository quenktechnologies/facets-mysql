import * as fs from 'fs';
import * as must from 'must/register';
import * as dsl from '@quenk/facets-dsl';
import * as src from '../src';
import { SQLPolicies, Options, compile, compileE } from '../src';

var input = null;
var tests = null;
var params = [];

const policies: SQLPolicies = {

    type: {

        type: 'string',
        operators: ['='],
        term: src.like

    },
    name: {

        type: 'string',
        operators: ['='],
        term: src.like

    },
    age: {

        type: 'number',
        operators: ['=', '>=', '>=', '>', '<'],
        term: src.operator

    },
    tag: {

        type: 'string',
        operators: ['='],
        term: src.like

    },
    religion: {

        type: 'string',
        operators: ['='],
        term: src.like

    },
    active: {

        type: 'boolean',
        operators: ['=', '>=', '>=', '>', '<'],
        term: src.operator

    },
    rank: {

        type: 'number',
        operators: ['=', '>=', '>=', '>', '<'],
        term: src.operator

    },
    'namespace': {

        type: 'number',
        operators: ['=', '>=', '>=', '<=', '>=', '<'],
        term: src.operator

    },
    user: {

        type: 'string',
        operators: ['='],
        term: src.like

    },
    price: {

        type: 'number',
        operators: ['=', '>=', '>=', '>', '<'],
        term: src.operator

    },
    filetype: 'string',
    dob: 'date'

}

const options: Options = {

    maxFilters: 100

};

function compare(tree: any, that: any): void {

    must(tree).eql(that);

}

function makeTest(test, index) {

    let file = index.replace(/\s/g, '-');
    let _compile = compile(options)(policies);
    let _compileE = compileE(options)(policies)(params);

    if (process.env.GENERATE) {
        _compile(test.input)
            .chain(sql => {

                fs.writeFileSync(`./test/expectations/${file}.sql`, sql);

                return _compileE(test.input).map(sql =>
                    fs.writeFileSync(`./test/expectations/${file}.escaped.sql`, sql));

            })
            .orRight(e => { if (!test.onError) throw new Error(e.message); })

    } else if (!test.skip) {

        _compile(test.input)
            .chain(sql => {

                compare(sql, fs.readFileSync(`./test/expectations/${file}.sql`, {
                    encoding: 'utf8'
                }));

                return _compileE(test.input)
                    .map(sql =>
                        compare(sql, fs.readFileSync(`./test/expectations/${file}.escaped.sql`, {
                            encoding: 'utf8'
                        })));

            })
            .orRight(e => {

                if (!test.onError)
                    throw new Error(e.message);

                test.onError(e);

            })

    }

}

tests = {

    'should compile a single filter': {

        input: 'type:c',

    },

    'should obey the policy': {

        input: 'phantom_field:anything',
        onError: e => must(e).eql(dsl.invalidFilterFieldErr({
            field: 'phantom_field',
            operator: 'default',
            value: 'anything'
        }))

    },
    'should correctly escape a single filter': {

        input: 'type:"a OR 1=1"'

    },
    'should reject types that do not match': {

        input: 'user:>=22',
        onError: e => must(e).eql(dsl.invalidFilterTypeErr({
            field: 'user',
            operator: '>=',
            value: 22

        }, 'string'))

    },
    'should parse three filters': {

        input: 'type:c name:johan active:false',

    },

    'should parse with all basic operators': {

        input: 'age:>14 rank:<23 price:>=22.40 namespace:<=5.40 name:"Product % name"',

    },

    'should parse with the OR operator': {

        input: 'tag:old OR tag:new'

    },

    'should parse with the OR operator continued': {

        input: 'tag:old OR tag:new OR user:grandma OR filetype:jpeg'

    },
    'should allow any character except \'"\' between double quotes': {

        input: 'type:"%><>?:L^#@!@#%^&p:%\'for long\'!@<=a:%22>=<>#\\$%^&{()\'\`f`\\"',

    },
    'should not allow double quotes between string literals': {

        input: 'type:"type%:"dom%""',
        onError: e => must(typeof e.message).be('string')

    },
    'should allow LIKE defaults': {

        input: 'religion:"hip hop"'

    },
    'should allow date literals': {

        input: 'dob:>1989-07-24'

    }

};

describe('Compiler', function() {

    beforeEach(function() {

        input = null;

    });

    describe('compile()', function() {

        Object.keys(tests).forEach(k => {

            it(k, function() {

                if (Array.isArray(tests[k])) {

                    tests[k].forEach(makeTest);

                } else {

                    makeTest(tests[k], k);

                }

            });
        });

    });

});
