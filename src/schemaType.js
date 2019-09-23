class schemaType {
    constructor(input) {
        //this.path = path;
        this.validators = [];
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
            this.minlength = input.minlength;
            this.maxlength = input.maxlength;
            this.enum = input.enum;
            this.match = input.match;
        }
        else {
            throw('Invalid type!');
        }

        //Build validators
        this.buildValidators();
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

    minValidator (value) {
        //debugger
        if (value < this.min) {
            throw new Error(`Value ${value} is lower than min ${this.min}`);
        }
        return true;
    }

    maxValidator (value) {
        if (value > this.max) {
            throw new Error(`Value ${value} is higher than max ${this.max}`);
        }
        return true;
    }

    minLengthValidator (value) {
        if (value.length < this.minlength) {
            throw new Error(`String "${value}" has length lower than min length ${this.minlength}`)
        }
        return true;
    }

    maxLengthValidator (value) {
        if (value.length > this.maxlength) {
            throw new Error(`String "${value}" has length higher than max length ${this.maxlength}`)
        }
        return true;
    }

    enumValidator (value) {
        if (!this.enum.includes(value)) {
            throw new Error(`String "${value}" is not included in [${this.enum}]`);
        }
    }

    matchValidator (value) {
        const regex = new RegExp(this.match);
        if (!regex.test(value)) {
            throw new Error(`String "${value}" is not matched "${this.match}"`);
        }
    }

    buildValidators () {
        if (this.type === Number && this.min !== undefined) {
            this.validators.push(this.minValidator);
        }
        if (this.type === Number && this.max !== undefined) {
            this.validators.push(this.maxValidator);
        }
        if (this.type === String && this.minlength !== undefined) {
            this.validators.push(this.minLengthValidator);
        }
        if (this.type === String && this.maxlength !== undefined) {
            this.validators.push(this.maxLengthValidator);
        }
        if (this.type === String && this.enum !== undefined) {
            this.validators.push(this.enumValidator);
        }
        if (this.type === String && this.match !== undefined) {
            this.validators.push(this.matchValidator);
        }
    }

    validate(value) {
        //const validators = this.validators;
        for (let validator of this.validators) {
            validator.call(this, value);
        }
        return true;
    }
}

module.exports = schemaType;