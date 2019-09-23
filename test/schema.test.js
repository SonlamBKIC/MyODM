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
     describe('Cast', function () {
         it("Cast functions on elements of array", function () {
             const schema = new Schema({
                 a: [Number],
                 b: [String],
                 c: [Boolean]
             });

             const testObj = {
                 a: ['10', true, false],
                 b: [10, true, false],
                 c: [1, 'yes', 0, 'no']
             };

             const castedObj = schema.cast2(testObj);

             assert.strictEqual(castedObj.a[0], 10);
             assert.strictEqual(castedObj.a[1], 1);
             assert.strictEqual(castedObj.a[2], 0);
             assert.strictEqual(castedObj.b[0], '10');
             assert.strictEqual(castedObj.b[1], 'true');
             assert.strictEqual(castedObj.b[2], 'false');
             assert.strictEqual(castedObj.c[0], true);
             assert.strictEqual(castedObj.c[1], true);
             assert.strictEqual(castedObj.c[2], false);
             assert.strictEqual(castedObj.c[3], false);
         })
     });
    describe('Validate',function () {
        it('min', function() {
            const schema = new Schema({
                a: {
                    type: Number,
                    min: 10
                }
            });

            assert.strictEqual(schema.validate({a: 20}), true);
            assert.throws(() => schema.validate({a: 5}), Error);
        });
        it('max', function() {
            const schema = new Schema({
                a: {
                    type: Number,
                    max: 10
                }
            });

            assert.strictEqual(schema.validate({a: 5}), true);
            assert.throws(() => schema.validate({a: 20}), Error);
        });
        it('minlength', function(){
            const schema = new Schema({
                a: {
                    type: String,
                    minlength: 5
                }
            });

            assert.strictEqual(schema.validate({a: 'hello'}), true);
            assert.throws(() => schema.validate({a: 'ok'}), Error);
        });
        it('maxlength', function(){
            const schema = new Schema({
                a: {
                    type: String,
                    maxlength: 5
                }
            });

            assert.strictEqual(schema.validate({a: 'hello'}), true);
            assert.throws(() => schema.validate({a: 'hello world'}), Error);
        });
        it('enum', function(){
            const schema = new Schema({
                a: {
                    type: String,
                    enum: ['hi', 'hello', 'aloha']
                }
            });

            assert.strictEqual(schema.validate({a: 'hi'}), true);
            assert.strictEqual(schema.validate({a: 'hello'}), true);
            assert.strictEqual(schema.validate({a: 'aloha'}), true);
            assert.throws(() => schema.validate({a: 'hello world'}), Error);
        });
        it('match', function() {
            const schema = new Schema({
                a: {
                    type: String,
                    match: 'hello'
                }
            });

            assert.strictEqual(schema.validate({a: 'hello world'}), true);
            assert.throws(() => schema.validate({a: 'hi world'}), Error);
        });
    })
});