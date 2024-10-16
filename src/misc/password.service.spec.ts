import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PasswordService } from './password.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a hashed password', async () => {
    const password = 'testPassword';
    const hash = await service.hashPassword(password);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(hash).not.toEqual(password);
  });

  it('should return true for matching passwords', async () => {
    const password = 'testPassword';
    const hash = await bcrypt.hash(password, 10);

    const result = await service.comparePassword(password, hash);
    expect(result).toBe(true); // Passwords should match
  });

  it('should return false for non-matching passwords', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    const password = 'testPassword';
    const hash = await bcrypt.hash('differentPassword', 10);

    const result = await service.comparePassword(password, hash);
    expect(result).toBe(false); // Passwords should not match
  });
});
