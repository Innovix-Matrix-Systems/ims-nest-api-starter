import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Custom validator to compare password and password confirmation
@ValidatorConstraint({ name: 'isPasswordConfirmed', async: false })
export class IsPasswordConfirmedValidator
  implements ValidatorConstraintInterface
{
  validate(passwordConfirmation: string, args: ValidationArguments) {
    const { password } = args.object as any;
    return password === passwordConfirmation;
  }

  defaultMessage() {
    return 'Password and password confirmation does not match!';
  }
}

export function IsPasswordConfirmed(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordConfirmedValidator,
    });
  };
}
