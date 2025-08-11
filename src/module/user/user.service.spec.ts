import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { DatabaseService } from '../database/database.service';
import { JwtConfig } from '../config/jwt.config';
import { UserRoles } from '../../common/enums/user.enum';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService - Unit Tests', () => {
  let service: UserService;
  let databaseService: any;
  let jwtConfig: JwtConfig;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRoles.user,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockUserWithoutPassword = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: UserRoles.user,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
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

    const mockJwtConfig = {
      saltRounds: 10,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: JwtConfig,
          useValue: mockJwtConfig,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    databaseService = module.get(DatabaseService);
    jwtConfig = module.get(JwtConfig);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('findByUsername', () => {
    it('should find user by username with password', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser', true);

      expect(result).toEqual(mockUser);
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
    });

    it('should find user by username without password', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUserWithoutPassword);

      const result = await service.findByUsername('testuser', false);

      expect(result).toEqual(mockUserWithoutPassword);
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
    });

    it('should return null if user not found', async () => {
      databaseService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUserWithoutPassword);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUserWithoutPassword);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
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
    });

    it('should return null if user not found by email', async () => {
      databaseService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByEmailOrUsername', () => {
    it('should return true if user exists by email', async () => {
      databaseService.user.findFirst.mockResolvedValue({ id: 1 });

      const result = await service.findByEmailOrUsername('test@example.com', 'testuser');

      expect(result).toBe(true);
      expect(databaseService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'test@example.com' },
            { username: 'testuser' }
          ]
        },
        select: {
          id: true,
        }
      });
    });

    it('should return false if user does not exist', async () => {
      databaseService.user.findFirst.mockResolvedValue(null);

      const result = await service.findByEmailOrUsername('nonexistent@example.com', 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('createUser', () => {
    const createUserInput = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
      role: UserRoles.user,
    };

    it('should create a new user successfully', async () => {
      databaseService.user.findFirst.mockResolvedValue(null); // User doesn't exist
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      databaseService.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserInput);

      expect(databaseService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'newuser@example.com' },
            { username: 'newuser' }
          ]
        },
        select: {
          id: true,
        }
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(databaseService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'hashedPassword123',
          role: UserRoles.user,
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        }
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      databaseService.user.findFirst.mockResolvedValue({ id: 1 }); // User exists

      await expect(service.createUser(createUserInput)).rejects.toThrow(ConflictException);
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(databaseService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const userWithPassword = { ...mockUser, password: 'hashedPassword' };
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(userWithPassword, 'password123');

      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return false for invalid password', async () => {
      const userWithPassword = { ...mockUser, password: 'hashedPassword' };
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(userWithPassword, 'wrongpassword');

      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
    });

    it('should throw error if password is not loaded', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };

      await expect(service.validatePassword(userWithoutPassword, 'password123'))
        .rejects.toThrow('User password not loaded');
    });
  });

  describe('getAllUsers', () => {
    const mockUsers = [
      {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        role: UserRoles.user,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 2,
        username: 'admin1',
        email: 'admin1@example.com',
        role: UserRoles.admin,
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
      },
    ];

    it('should return all users', async () => {
      databaseService.user.findMany.mockResolvedValue(mockUsers);

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
          createdAt: 'desc'
        }
      });
      expect(result).toEqual([
        {
          user: {
            id: 1,
            username: 'user1',
            email: 'user1@example.com',
            role: UserRoles.user,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
          }
        },
        {
          user: {
            id: 2,
            username: 'admin1',
            email: 'admin1@example.com',
            role: UserRoles.admin,
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02'),
          }
        }
      ]);
    });

    it('should return empty array if no users found', async () => {
      databaseService.user.findMany.mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
    });
  });
});