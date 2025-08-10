import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { UserRoles } from 'src/common/enums/user.enum';
import { DatabaseService } from '../database/database.service';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let databaseService: DatabaseService;

  const mockDbUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'user' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDbAdmin = {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: 'hashedAdminPassword',
    role: 'admin' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockDatabaseService = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUsername', () => {
    it('should find user by username without password', async () => {
      const userWithoutPassword = {
        ...mockDbUser,
        password: null,
      };

      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(userWithoutPassword as any);

      const result = await service.findByUsername('testuser', false);

      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: {
          id: true,
          username: true,
          email: true,
          password: false,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(userWithoutPassword);
    });

    it('should find user by username with password', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(mockDbUser);

      const result = await service.findByUsername('testuser', true);

      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: {
          id: true,
          username: true,
          email: true,
          password: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(mockDbUser);
    });

    it('should return null when user not found', async () => {
      jest.spyOn(databaseService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validatePassword(mockDbUser, 'password123');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validatePassword(mockDbUser, 'wrongpassword');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword123');
      expect(result).toBe(false);
    });

    it('should throw error when password is not loaded', async () => {
      const userWithoutPassword = { ...mockDbUser, password: undefined };

      await expect(
        service.validatePassword(userWithoutPassword, 'password123')
      ).rejects.toThrow('User password not loaded');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with converted roles', async () => {
      const dbUsers = [mockDbUser, mockDbAdmin];

      jest.spyOn(databaseService.user, 'findMany').mockResolvedValue(dbUsers);

      const result = await service.getAllUsers();

      expect(databaseService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual([
        {
          id: mockDbUser.id,
          username: mockDbUser.username,
          email: mockDbUser.email,
          role: UserRoles.user,
          createdAt: mockDbUser.createdAt,
          updatedAt: mockDbUser.updatedAt,
        },
        {
          id: mockDbAdmin.id,
          username: mockDbAdmin.username,
          email: mockDbAdmin.email,
          role: UserRoles.admin,
          createdAt: mockDbAdmin.createdAt,
          updatedAt: mockDbAdmin.updatedAt,
        },
      ]);
    });
  });
});
