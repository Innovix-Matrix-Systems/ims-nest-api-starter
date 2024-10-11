import { Inject, Injectable, forwardRef } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { UserService } from '../user/user.service';

@Injectable()
@ValidatorConstraint({ name: 'isUserEmailUnique', async: true })
export class UserEmailUniqueValidator implements ValidatorConstraintInterface {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async validate(value: string, args: ValidationArguments) {
    const user = await this.userService.findByEmail(value);
    const excludeUserId = (args?.object as any)?.id ?? 0; //we pass id in update payload
    if (!user) {
      return true;
    }
    if (user.id === excludeUserId) {
      return true;
    }

    return false;
  }

  defaultMessage() {
    return 'Email already exists';
  }
}

export function IsUserEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: UserEmailUniqueValidator,
    });
  };
}
