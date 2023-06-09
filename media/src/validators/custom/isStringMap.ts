import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

export function IsStringMap(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isStringMap',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'object') return false;
                    return (
                        Object.entries(value)
                            .flat()
                            .find((x) => typeof x !== 'string') === undefined
                    );
                },
            },
        });
    };
}
