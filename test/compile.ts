import * as must from 'must/register';
import * as fs from 'fs';
import { compile, Context } from '../src';

var input = null;
var tests = null;

const ctx = new Context('SELECT * FROM ??', ['database.table']);

function compare(tree: any, that: any): void {

    must(tree).eql(that);

}

function makeTest(test, index) {

    var file = index.replace(/\s/g, '-');

    if (process.env.GENERATE) {
        compile(test.input, opts, ctx).cata(
            e => { if (!test.onError) throw new Error(e); },
            c => {
                fs.writeFileSync(`./test/expectations/${file}.escaped.sql`, c.toString());
                fs.writeFileSync(`./test/expectations/${file}.sql`, c.toSQL());
            });
        return;
    }

    if (!test.skip) {

        compile(test.input, opts, ctx)
            .cata(
            e => { if (test.onError) return test.onError(e); throw new Error(e) },
            c => {

                compare(c.toString(), fs.readFileSync(`./test/expectations/${file}.escaped.sql`, {
                    encoding: 'utf8'
                }))
                compare(c.toSQL(), fs.readFileSync(`./test/expectations/${file}.sql`, {
                    encoding: 'utf8'
                }))
            });

    }

}
const opts = {

    policy: {

        type: 'string',
        name: { type: 'string', cast: String },
        age: 'number',
        tag: 'string',
        active: 'boolean',
        rank: 'number',
        'namespace.discount': 'number',
        user: 'string',
        price: 'number',
        filetype: 'string'

    }

}

tests = {

    'should compile a single filter': {
        input: 'type:c',
    },

    'should obey the policy': {

        input: 'phantom_field:anything',
        onError: e => must(e).be(`Unknown column name 'phantom_field'!`)

    },
    'should correctly escape a single filter': {

        input: 'type:%"a OR 1=1"'

    },
    'should reject types that do not match': {

        input: 'user:>=22',
        onError: e => must(e).be(`user must be type 'string' got 'number'`)

    },
    'should cast': {

        input: 'name:22'

    },
    'should parse three filters': {

        input: 'type:c name:johan active:false',

    },

    'should parse with all basic operators': {

        input: 'age:>14 rank:<23 price:>=22.40 namespace.discount:<=5.40 name:%"Product % name"',

    },

    'should parse with the OR operator': {

        input: 'tag:old OR tag:new'

    },

    'should parse with the OR operator continued': {

        input: 'tag:old OR tag:new OR user:%grandma OR filetype:jpeg'

    },
    'should allow any character except \'"\' between double quotes': {

        input: 'type:%"%><>?:L^#@!@#%^&p:%\'for long\'!@<=a:%22>=<>#\\$%^&{()\'\`f`\\"',

    },
    'should not allow double quotes between string literals': {

        input: 'type:%"type%:"dom%""',
        onError: m => must(m).be('Invalid Syntax')

    },

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

        it('should not generate where keyword by default if not specified', () => {

            let ctx = new Context('SELECT * FROM table WHERE stage >= 1 AND');

            compile('stage:22', { policy: { stage: 'number' } }, ctx)
                .cata(
                e => { throw new Error(e); },
                c => must(c.toSQL()).be(`SELECT * FROM table WHERE stage >= 1 AND \`stage\` = 22`));

        });

        it('should not generate where keyword if already there', () => {

            let ctx = new Context('SELECT * FROM table WHERE stage >= 1 AND');

            compile('stage:22', { insertWhereKeyword: true, policy: { stage: 'number' } }, ctx)
                .cata(
                e => { throw new Error(e); },
                c => must(c.toSQL()).be(`SELECT * FROM table WHERE stage >= 1 AND \`stage\` = 22`));

        });

        it('should generate where keyword ', () => {

            let ctx = new Context('SELECT * FROM table');

            compile('stage:22', { insertWhereKeyword: true, policy: { stage: 'number' } }, ctx)
                .cata(
                e => { throw new Error(e); },
                c => must(c.toSQL()).be(`SELECT * FROM table WHERE \`stage\` = 22`));

        });

    });

});
