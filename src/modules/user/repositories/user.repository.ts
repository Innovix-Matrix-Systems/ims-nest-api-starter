import { EntityRepository } from '@mikro-orm/core'; // or any other driver package
import { User } from '../entities/user.entity';

export class UserRepository extends EntityRepository<User> {
  async findWithRoleAndPermission(id: number): Promise<User> {
    return await this.findOne(
      { id },
      {
        populate: ['roles', 'permissions'],
      },
    );
  }

  async findByEmailWithRoleAndPermission(email: string): Promise<User> {
    return await this.findOne(
      { email },
      {
        populate: ['roles', 'permissions'],
      },
    );
  }
}
