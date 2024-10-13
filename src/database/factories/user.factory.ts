import { faker } from '@faker-js/faker';
import { Factory } from '@mikro-orm/seeder';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';

export class UserFactory extends Factory<User> {
  model = User;

  definition(): Partial<User> {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: bcrypt.hashSync('123456', 10),
      isActive: true,
    };
  }
}
