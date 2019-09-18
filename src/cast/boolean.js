module.exports = function castBoolean(value) {
    if (value == null) {
        return value;
    }

    const trueValues = [true, 'true', 1, '1', 'yes'];
    const falseValues = [false, 'false', 0, '0', 'no'];

    if (trueValues.includes(value)) {
        return true;
    }

    if (falseValues.includes(value)) {
        return false;
    }

    throw('Cannot cast value to Boolean!');
};