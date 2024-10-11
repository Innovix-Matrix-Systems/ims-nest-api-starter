import { Factory } from '@mikro-orm/seeder';
import { faker } from '@faker-js/faker';
import { User } from '../../entities/user.entity';

export class UserFactory extends Factory<User> {
  model = User;

  definition(): Partial<User> {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: '123456',
      isActive: true,
    };
  }
}
