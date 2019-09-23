const cast = require('./cast/cast');
const schemaType = require('./schemaType');
const utils = require('./utils');
const _ = require('lodash');

class Schema {
    constructor(obj, options) {
        this.obj = obj;
        this.options = options;
        this.tree = {};
        this.keys = Object.keys(obj);
        this.paths = {};
        this.arrayPaths = {};
        this.nested = {};
        // for (let key of this.keys) {
        //     this.obj[key] = new schemaType(obj[key]);
        // }

        // Build paths
        this.add(obj);

        // Build array paths;
        this.arrayPath()
    }


    // Create object with default value from schema
    create() {
        const resultObj = {};
        for (let key of Object.keys(this.paths)) {
            _.set(resultObj, key, _.get(this.tree, key + '.default'));
        }
        return resultObj;
    };

    // Cast function that only work on one array level
    cast(obj) {
        const resultObj = {};
        for (let key of Object.keys(this.paths)) {
            this.castObjPath(obj, key, key, resultObj);
        }
        for (let arrayPath of Object.keys(this.arrayPaths)) {
            const array = _.get(obj, arrayPath);
            if (array){
                for (let i = 1; i < array.length; i++){
                    for (let elementPath of this.arrayPaths[arrayPath]) {
                        const writePath = elementPath.replace('0', i);
                        this.castObjPath(obj, writePath, elementPath, resultObj);
                    }
                }
            }
        }
        return resultObj;
    }

    castObjPath (obj, objPath, schemaPath, resultObj) {
        if(_.get(obj, objPath) == null) {
            _.set(resultObj, objPath, _.get(this.tree, schemaPath + '.default'));
        }
        else {
            _.set(resultObj, objPath, cast(_.get(this.tree, schemaPath + '.type'), _.get(obj, objPath)));
        }
    }

    buildObjPaths(obj, prefix, key, splitPath, objPaths) {
        prefix = prefix || '';
        const fullPath = prefix + key;
        if (splitPath.length === 0) {
            if (key === '0') {
                const arr = _.get(obj, prefix.slice(0,prefix.length-1));
                for (let i = 0; i < arr.length; i++) {
                    objPaths.push(prefix + i);
                }
            } else {
                objPaths.push(fullPath);
            }
        }
        else {
            const nextKey = splitPath.shift();
            if (key === '0') {
                const arr = _.get(obj, prefix.slice(0,prefix.length-1));
                for (let i = 0; i < arr.length; i++) {
                    this.buildObjPaths(obj, prefix + i + '.', nextKey, splitPath, objPaths);
                }
                splitPath.unshift(nextKey);
            } else {
                this.buildObjPaths(obj, fullPath + '.', nextKey, splitPath, objPaths);
                splitPath.unshift(nextKey);
            }
        }
    }


    // Cast function that work on multiple array level
    cast2(obj) {
        const objPaths = [];
        const resultObj = {};
        for (let path of Object.keys(this.paths)) {
            const splitPath = path.split('.');
            const tempKey = splitPath.shift();
            this.buildObjPaths(obj,'', tempKey, splitPath, objPaths);
        }
        for (let objPath of objPaths) {
            const schemaPath = objPath.replace(/\.\d+\./g, '.0.').replace(/\.\d+$/, '.0');
            this.castObjPath(obj, objPath, schemaPath, resultObj);
        }
        return resultObj;
    }

    validate(obj) {
        // Build object's paths
        const objPaths = [];
        const resultObj = {};
        for (let path of Object.keys(this.paths)) {
            const splitPath = path.split('.');
            const tempKey = splitPath.shift();
            this.buildObjPaths(obj,'', tempKey, splitPath, objPaths);
        }

        // Check require
        for (let objPath of objPaths) {
            const schemaPath = objPath.replace(/\.\d+\./g, '.0.').replace(/\.\d+$/, '.0');
            if (!_.get(obj, objPath) && _.get(this.tree, schemaPath + '.require')) {
                throw new Error(`Path "${objPath}" is required!`);
            }
        }

        // Cast
        for (let objPath of objPaths) {
            const schemaPath = objPath.replace(/\.\d+\./g, '.0.').replace(/\.\d+$/, '.0');
            this.castObjPath(obj, objPath, schemaPath, resultObj);
        }

        // Validate
        for (let objPath of objPaths) {
            const schemaPath = objPath.replace(/\.\d+\./g, '.0.').replace(/\.\d+$/, '.0');
            _.get(this.tree, schemaPath).validate(_.get(resultObj, objPath));
        }

        // Return result
        return true;
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
                        this.arrayPaths[fullPath] = true;
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

    arrayPath() {
        for (let key in this.arrayPaths) {
            this.arrayPaths[key] = _.filter(Object.keys(this.paths), function(path) {
                const arrayRegex = new RegExp(key + '.0');
                return arrayRegex.test(path);
            })
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
// const schema3 = new Schema({
//     a: [
//         {
//             b: {
//                 type: Number,
//                 default: 10
//             },
//             c: String,
//             h: {
//                 f: String,
//                 g: Boolean,
//             }
//         }
//     ],
//     d: [Number]
// });
//
// const testObj5 = schema3.cast({
//     a: [
//         {
//             b: '100'
//         }
//     ]
// });
//
// console.log('Array nested test: \n', testObj5);

// const schema4 = new Schema({
//     a: [
//         {
//             b: {
//                 type: Number,
//                 default: 10,
//                 require: true,
//                 min: 0,
//                 max: 100
//             },
//             c: {
//                 type: String,
//                 minlength: 3,
//                 maxlength: 20,
//                 enum: ['true', 'false']
//             },
//             h: {
//                 f: String,
//                 g: Boolean,
//             }
//         }
//     ],
//     d: [Number]
// });
//
// const testObj6 = {
//     a: [
//         {
//             b: '10',
//             c: 'dfasdf',
//         },
//         {
//             b: '100',
//             c: true
//         },
//         {
//             b: '1',
//             c: 'abc'
//         },
//         {
//             b: 100,
//             c: false
//         }
//     ],
//     d: ['13', true, false]
// };
//
// console.log(schema4.cast2(testObj6));
// console.log(schema4.validate(testObj6));
//
// const schema5 = new Schema({
//    a: {
//        b: [
//            {
//                c: [
//                    {
//                        d: Number,
//                        e: String
//                    }
//                ],
//                f: Boolean
//            }
//        ],
//        g: Number
//    },
//    h:[Number]
// });
//
// const testObj7 = {
//     a: {
//         b: [
//             {
//                 c: [
//                     {
//                         d : '10'
//                     },
//                     {
//                         e: 'dafsdf'
//                     }
//                 ]
//             },
//             {
//                 c: [
//                     {
//                         d : 2134
//                     },
//                     {
//                         e: 'dafs'
//                     }
//                 ]
//             }
//         ]
//     },
//     h: ['10', '20', true, false]
// };
//
// testObj8 = schema5.cast2(testObj7);
// console.log(testObj8);

module.exports = Schema;