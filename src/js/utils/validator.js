export class Validator {
    constructor() {
        this.rules = {
            required: (value) => {
                return value && value.trim() !== '' ? [] : ['This field is required'];
            },
            
            email: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) ? [] : ['Invalid email address'];
            },
            
            minLength: (value, min) => {
                return value.length >= min ? 
                    [] : [`Must be at least ${min} characters`];
            },
            
            maxLength: (value, max) => {
                return value.length <= max ? 
                    [] : [`Must not exceed ${max} characters`];
            },
            
            pattern: (value, pattern) => {
                return pattern.test(value) ? 
                    [] : ['Invalid format'];
            },
            
            url: (value) => {
                try {
                    new URL(value);
                    return [];
                } catch {
                    return ['Invalid URL'];
                }
            },
            
            numeric: (value) => {
                return !isNaN(value) ? [] : ['Must be a number'];
            },
            
            match: (value, fieldName) => {
                const matchField = document.querySelector(`[name="${fieldName}"]`);
                return matchField && matchField.value === value ? 
                    [] : [`Must match ${fieldName}`];
            }
        };
    }

    validate(value, rules) {
        let errors = [];

        Object.entries(rules).forEach(([rule, ruleValue]) => {
            if (typeof this.rules[rule] === 'function') {
                errors = [...errors, ...this.rules[rule](value, ruleValue)];
            }
        });

        return errors;
    }

    addRule(name, validator) {
        this.rules[name] = validator;
    }
}

export const validator = new Validator();