import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStringMap(validationOptions?: ValidationOptions) {
    return function (object: NonNullable<unknown>, propertyName: string) {
        registerDecorator({
            name: 'isStringMap',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    if (typeof value !== 'object' || value === null)
                        return false;
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
