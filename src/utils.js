exports.isPOJO = function isPOJO(arg) {
    if (arg == null || typeof arg !== 'object') {
        return false;
    }
    const proto = Object.getPrototypeOf(arg);
    // Prototype may be null if you used `Object.create(null)`
    // Checking `proto`'s constructor is safe because `getPrototypeOf()`
    // explicitly crosses the boundary from object data to object metadata
    return !proto || proto.constructor.name === 'Object';
};

const paths = [];

exports.buildPath = function buildPath(obj, prefix) {
    prefix = prefix || '';
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const fullPath = prefix + key;

        if (Array.isArray(obj[key])) {
            if (obj[key].length > 0) {
                buildPath(obj[key], fullPath + '.');
            }
        } else if (typeof obj[key] === 'object') {
            // Nested object case
            if (Object.keys(obj[key]).length > 0) {
                buildPath(obj[key], fullPath + '.');
            }
        } else {
            // Normal case
            paths.push(fullPath);
        }
    }

    return paths;
};