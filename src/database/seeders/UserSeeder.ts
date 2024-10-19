import type { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/user/entities/user.entity';
import { Role } from '../../modules/role/entities/role.entity';

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const roleRepository: EntityRepository<Role> = em.getRepository(Role);
    const userRepository: EntityRepository<User> = em.getRepository(User);

    const superAdminRole = await roleRepository.findOne({ name: 'SuperAdmin' });
    const adminRole = await roleRepository.findOne({ name: 'Admin' });
    const userRole = await roleRepository.findOne({ name: 'User' });

    const superAdmin = userRepository.create({
      name: 'SuperAdmin IMS',
      email: 'superadmin@ims.com',
      password: await bcrypt.hash('123456', 10),
      isActive: true,
      roles: [superAdminRole],
    });
    em.persist(superAdmin);

    const admin = userRepository.create({
      name: 'Admin IMS',
      email: 'admin@ims.com',
      password: await bcrypt.hash('123456', 10),
      isActive: true,
      roles: [adminRole],
    });
    em.persist(admin);

    const user = userRepository.create({
      name: 'User IMS',
      email: 'user@ims.com',
      password: await bcrypt.hash('123456', 10),
      isActive: true,
      roles: [userRole],
    });
    em.persist(user);

    await em.flush();
  }
}
