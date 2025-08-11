import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseService } from '../database/database.service';
import { JwtConfig } from '../config/jwt.config';
import { UserRoles } from '../../common/enums/user.enum';
import { ConflictException } from '@nestjs/common';

describe('User Module - Integration Tests', () => {
  let userService: UserService;
  let userController: UserController;
  let databaseService: any;

  // Mock data
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

  // Mock database service
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
    secret: 'test-secret',
    expiresIn: '1h',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
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

    userService = module.get<UserService>(UserService);
    userController = module.get<UserController>(UserController);
    databaseService = module.get(DatabaseService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Service and Controller Integration', () => {
    it('should create user through controller and service', async () => {
      const createUserData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        role: UserRoles.user,
      };

      // Mock service calls
      databaseService.user.findFirst.mockResolvedValue(null); // User doesn't exist
      databaseService.user.create.mockResolvedValue(mockUser);

      const result = await userController.createUser(createUserData);

      expect(result).toHaveProperty('user');
      expect(result.user).toMatchObject({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(databaseService.user.findFirst).toHaveBeenCalled();
      expect(databaseService.user.create).toHaveBeenCalled();
    });

    it('should get all users through controller and service', async () => {
      const mockUsers = [mockUserWithoutPassword];
      databaseService.user.findMany.mockResolvedValue(mockUsers);

      const result = await userController.getAllUsers();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('user');
      expect(result[0].user).toMatchObject({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(databaseService.user.findMany).toHaveBeenCalled();
    });

    it('should handle user creation conflict through layers', async () => {
      const createUserData = {
        email: 'existing@example.com',
        username: 'existing',
        password: 'password123',
        role: UserRoles.user,
      };

      // Mock existing user
      databaseService.user.findFirst.mockResolvedValue({ id: 1 });

      await expect(userController.createUser(createUserData))
        .rejects.toThrow(ConflictException);

      expect(databaseService.user.findFirst).toHaveBeenCalled();
      expect(databaseService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('Service Methods Integration', () => {
    it('should find user by username with integration flow', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findByUsername('testuser', true);

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

    it('should find user by email with integration flow', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUserWithoutPassword);

      const result = await userService.findByEmail('test@example.com');

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

    it('should check user existence by email or username', async () => {
      databaseService.user.findFirst.mockResolvedValue({ id: 1 });

      const result = await userService.findByEmailOrUsername('test@example.com', 'testuser');

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

    it('should validate user password integration', async () => {
      const userWithPassword = { ...mockUser, password: 'hashedPassword' };
      
      // Mock bcrypt
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await userService.validatePassword(userWithPassword, 'password123');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should create user with password hashing integration', async () => {
      const createUserData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        role: UserRoles.user,
      };

      // Mock bcrypt
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword123');

      databaseService.user.findFirst.mockResolvedValue(null);
      databaseService.user.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(createUserData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
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
      expect(result).toHaveProperty('user');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database errors in service layer', async () => {
      databaseService.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      await expect(userService.findByUsername('testuser'))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle user creation errors through controller', async () => {
      const createUserData = {
        email: 'test@example.com',
        username: 'test',
        password: 'password123',
        role: UserRoles.user,
      };

      databaseService.user.findFirst.mockRejectedValue(new Error('Database error'));

      await expect(userController.createUser(createUserData))
        .rejects.toThrow('Database error');
    });

    it('should handle password validation errors', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };

      await expect(userService.validatePassword(userWithoutPassword, 'password123'))
        .rejects.toThrow('User password not loaded');
    });
  });

  describe('Data Flow Integration', () => {
    it('should handle complete user creation flow', async () => {
      const createUserData = {
        email: 'complete@example.com',
        username: 'complete',
        password: 'password123',
        role: UserRoles.admin,
      };

      const expectedUser = {
        id: 5,
        username: 'complete',
        email: 'complete@example.com',
        role: UserRoles.admin,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock all the flow
      databaseService.user.findFirst.mockResolvedValue(null);
      databaseService.user.create.mockResolvedValue(expectedUser);

      const result = await userController.createUser(createUserData);

      // Verify data transformation through the layers
      expect(result.user.role).toBe(UserRoles.admin);
      expect(result.user.email).toBe(createUserData.email);
      expect(result.user.username).toBe(createUserData.username);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should handle user listing with proper data structure', async () => {
      const mockUsers = [
        { ...mockUserWithoutPassword, id: 1 },
        { ...mockUserWithoutPassword, id: 2, username: 'user2', email: 'user2@example.com' },
      ];

      databaseService.user.findMany.mockResolvedValue(mockUsers);

      const result = await userController.getAllUsers();

      expect(result).toHaveLength(2);
      result.forEach((userResponse, index) => {
        expect(userResponse).toHaveProperty('user');
        expect(userResponse.user.id).toBe(mockUsers[index].id);
        expect(userResponse.user.username).toBe(mockUsers[index].username);
        expect(userResponse.user.email).toBe(mockUsers[index].email);
      });
    });
  });
});