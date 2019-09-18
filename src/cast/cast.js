const castNumber = require('./number');
const castString = require('./string');
const castBoolean = require('./boolean');

module.exports = function cast(caster, value) {
    switch (caster) {
        case(Number):
            return castNumber(value);
        case(String):
            return castString(value);
        case(Boolean):
            return castBoolean(value);
        default:
            throw('Invalid caster!');
    }
};

