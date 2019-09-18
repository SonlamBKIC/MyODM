module.exports = function castString(value, path) {
    if (value == null) {
        return value;
    }

    if (value.toString &&
        value.toString !== Object.prototype.toString &&
        !Array.isArray(value)) {
        return value.toString();
    }

    throw('Cannot cast value to String!');
};
