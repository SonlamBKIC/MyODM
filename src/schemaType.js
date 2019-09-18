class schemaType {
    constructor(input) {
        if (input instanceof Function) {
            this.type = input;
            this.require = false;
            this.default = this.default(this.type);
        }
        else if(input instanceof Object) {
            this.type = input.type;
            this.require = input.require || false;
            this.default = input.default || this.default(this.type);
            this.min = input.min;
            this.max = input.max;
        }
        else {
            throw('Invalid type!');
        }
    }

    default(type) {
        switch (type) {
            case(Number):
                return 0;
            case(String):
                return '';
            case(Boolean):
                return false;
            case(Array):
                return [];
            default:
                return undefined;
        }
    }
}

module.exports = schemaType;