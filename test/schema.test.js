const assert = require('assert');
const Schema = require('../src/schema');

describe('Schema', function () {
    describe('Create', function () {
        it('Nested object', function(){
            const schema = new Schema({
            a: {
                b: {
                    type: Number,
                    default: 10
                },
                c: {
                    type: String,
                    default: 'This is a string!'
                },
                h: {
                    g: Number,
                    f: {
                        i: String
                    }
                }
            },
            d: Boolean
        });

        const testObj = schema.create();

        assert.strictEqual(testObj.a.b, 10);
        assert.strictEqual(testObj.a.c, 'This is a string!');
        assert.strictEqual(testObj.a.h.g, 0);
        assert.strictEqual(testObj.a.h.f.i, '');
        assert.strictEqual(testObj.d, false);
        });
        it ('Array of object', function(){
            const schema = new Schema({
                a: [
                    {
                        b: {
                            type: Number,
                            default: 10
                        },
                        c: String,
                        h: {
                            f: String,
                            g: Boolean,
                        }
                    }
                ],
                d: [Number]
            });

            const testObj = schema.create();

            assert.strictEqual(testObj.a[0].b, 10);
            assert.strictEqual(testObj.a[0].c, '');
            assert.strictEqual(testObj.a[0].h.f, '');
            assert.strictEqual(testObj.a[0].h.g,false);
            assert.strictEqual(testObj.d[0], 0);
        })
    });
    // describe('Cast', function () {
    // })
});