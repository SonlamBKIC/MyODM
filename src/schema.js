const cast = require('./cast/cast');
const schemaType = require('./schemaType');
const utils = require('./utils');
const _ = require('lodash');

class Schema {
    constructor(obj) {
        this.obj = {};
        this.tree = {};
        this.keys = Object.keys(obj);
        this.paths = {};
        this.nested = {};
        for (let key of this.keys) {
            this.obj[key] = new schemaType(obj[key]);
        }
        this.add(obj);
    }


    cast(obj) {
        const resultObj = {};
        for (let key of Object.keys(this.paths)) {
            if (!_.get(obj, key)) {
                _.set(resultObj, key, _.get(this.tree, key + '.default'));
            }
            else {
                _.set(resultObj, key, cast(_.get(this.tree, key + '.type'), _.get(obj, key)));
            }
        }
        return resultObj;
    }

    create() {
        const resultObj = {};
        for (let key of Object.keys(this.paths)) {
            _.set(resultObj, key, _.get(this.tree, key + '.default'));
        }
        return resultObj;
    };

    validate(obj) {
        // Check require
        for (let key of this.keys) {
            if ((obj.hasOwnProperty(key) === false) && (this.obj[key].require === true)) {
                throw new Error(`Field "${key}" is required!`);
            }
        }

        const castedObj = this.cast(obj);

        // Check min max
        for (let key of this.keys) {
            if(key === Number && this.obj[key].min && castedObj[key] < this.obj[key].min) {
                throw new Error(`Field "${key}" is lower than min!`);
            }
            if(key === Number && this.obj[key].max && castedObj[key] > this.obj[key].max) {
                throw new Error(`Field "${key}" is higher than max!`);
            }
        }

        return castedObj;
    }

    add(obj, prefix) {
        prefix = prefix || '';
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const fullPath = prefix + key;

            // Check if path is null
            if (obj[key] == null) {
                throw new Error(`"${obj[key]}" is invalid for path "${fullPath}"`);
            }

            if (Array.isArray(obj[key])) {
                // Array case
                if (obj[key].length === 0){
                    this.paths[fullPath] = {path: fullPath};
                    _.set(this.tree, fullPath, new schemaType(Array));
                }
                else if (obj[key].length === 1) {
                    if (obj[key][0] == null) {
                        throw new Error(`"${obj[key][0]}" is invalid for array path "${fullPath}"`)
                    } else {
                        this.add(obj[key], fullPath+ '.');
                    }
                }
                else {
                    throw new Error(`Array path "${fullPath}" can only have one schema`)
                }
            } else if (utils.isPOJO(obj[key]) && !obj[key].hasOwnProperty('type')) {
                // Nested object case
                if(Object.keys(obj[key]).length > 0 ) {
                    this.nested[fullPath] = true;
                    this.add(obj[key], fullPath + '.');
                }
                else {
                    throw new Error(`Path "${fullPath}" cannot be empty`);
                }
            }
            else {
                // Normal case
                this.paths[fullPath] = {path: fullPath};
                //console.log((obj[key]));
                _.set(this.tree, fullPath, new schemaType(obj[key]));
            }
        }
    }
}

// const schema = new Schema({
// //    a: {
// //        type: Number,
// //        require: true,
// //        default: 10,
// //        min: 0,
// //        max: 100,
// //    },
//     b: {
//        type: String,
//         default: `It's golden, like daylight.`
//     },
//     c: {
//        type: Boolean,
//         default: true
//     }
// });
//
// const testObj1 = schema.create();
// console.log('Create test: \n', testObj1);
//
// const testObj2 = {
//     a: '3',
//     b: 10,
//     c: 'no'
// };
// console.log('Cast test: \n', schema.cast(testObj2));
//
// const testObj3 = {
//     a:'-1',
//     b: 'asdfadasdfadf',
//     c: 'yes'
// };
//
// console.log('Validate test \n', schema.validate(testObj3));
//
// const schema2 = new Schema({
//     a: {
//         b: {
//             type: Number,
//             default: 10
//         },
//         c: {
//             type: String,
//             default: 'This is a string!'
//         },
//         h: {
//             g: Number,
//             f: {
//                 i: String
//             }
//         }
//     },
//     d: Boolean
// });
//
// const testObj4 = schema2.create();
//
// console.log('Nested test: \n', testObj4);
//
const schema3 = new Schema({
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

const testObj5 = schema3.cast({
    a: [
        {
            b: '100'
        }
    ]
});

console.log('Array nested test: \n', testObj5);

module.exports = Schema;