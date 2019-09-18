const assert = require('assert');

module.exports = function castNumber(val){
    val = Number(val);

    assert.ok(!isNaN(val), 'Cannot cast value to Number!');

    if (typeof val === 'number' || val instanceof Number) {
        return val;
    }
};