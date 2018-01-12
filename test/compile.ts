import * as must from 'must/register';
import * as fs from 'fs';
import * as verticies from '../src/vertices';
import * as src from '../src';
import { Context, Policies, compile, convert } from '../src';

var input = null;
var tests = null;
var params = [];

const policies: Policies<string> = {

    type: {

        type: 'string',
        operators: ['='],
        vertex: verticies.like

    },
    name: {

        type: 'string',
        operators: ['='],
        vertex: verticies.like

    },
    age: {

        type: 'number',
        operators: ['=', '>=', '>=', '>', '<'],
        vertex: verticies.operator

    },
    tag: {

        type: 'string',
        operators: ['='],
        vertex: verticies.like

    },
    religion: {

        type: 'string',
        operators: ['='],
        vertex: verticies.like

    },
    active: {

        type: 'boolean',
        operators: ['=', '>=', '>=', '>', '<'],
        vertex: verticies.operator

    },
    rank: {

        type: 'number',
        operators: ['=', '>=', '>=', '>', '<'],
        vertex: verticies.operator

    },
    'namespace.discount': {

        type: 'number',
        operators: ['=', '>=', '>=', '<=', '>=', '<'],
        vertex: verticies.operator

    },
    user: {

        type: 'string',
        operators: ['='],
        vertex: verticies.like

    },
    price: {

        type: 'number',
        operators: ['=', '>=', '>=', '>', '<'],
        vertex: verticies.operator

    },
    filetype: 'string'

}

const ctx: Context<string> = {

    options: {

        maxFilters: 100

    },
    policies: verticies.availablePolicies,
    and: verticies.and,
    or: verticies.or,
    empty: verticies.empty

};

function compare(tree: any, that: any): void {

    must(tree).eql(that);

}

function makeTest(test, index) {

    var file = index.replace(/\s/g, '-');

    if (process.env.GENERATE) {
        (compile(ctx)(policies)(test.input))
            .chain(sql => {

                fs.writeFileSync(`./test/expectations/${file}.sql`, sql);

                return (convert(ctx)(policies)(test.input))
                    .chain((c: verticies.SQLVertex) => c.escape(params))
                    .map(sql =>
                        fs.writeFileSync(`./test/expectations/${file}.escaped.sql`, sql));

            })
            .orRight(e => { if (!test.onError) throw new Error(e.message); })

    } else if (!test.skip) {

        (compile(ctx)(policies)(test.input))
            .chain(sql => {

                compare(sql, fs.readFileSync(`./test/expectations/${file}.sql`, {
                    encoding: 'utf8'
                }));

                return (convert(ctx)(policies)(test.input))
                    .chain((c: verticies.SQLVertex) => c.escape(params))
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
        onError: e => must(e).eql(src.invalidFilterFieldErr({
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
        onError: e => must(e).eql(src.invalidFilterTypeErr({
            field: 'user',
            operator: '>=',
            value: 22

        }, 'string'))

    },
    'should parse three filters': {

        input: 'type:c name:johan active:false',

    },

    'should parse with all basic operators': {

        input: 'age:>14 rank:<23 price:>=22.40 namespace.discount:<=5.40 name:"Product % name"',

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
