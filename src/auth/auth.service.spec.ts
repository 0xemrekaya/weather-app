import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRoles } from './enums/role.enum';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRoles.user,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin = {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: 'hashedAdminPassword',
    role: UserRoles.admin,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should successfully login user and return token', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      (jwtService.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: {
          id: true,
          username: true,
          password: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });
      expect(result).toEqual({
        token: 'mock-jwt-token',
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

    it('should successfully login admin and return token', async () => {
      // Arrange
      const adminLoginDto: LoginDto = {
        username: 'admin',
        password: 'adminPassword',
      };
      
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      (jwtService.sign as jest.Mock).mockReturnValue('mock-admin-jwt-token');

      // Act
      const result = await service.login(adminLoginDto);

      // Assert
      expect(result.user.role).toBe(UserRoles.admin);
      expect(result.token).toBe('mock-admin-jwt-token');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: {
          id: true,
          username: true,
          password: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
    });

    it('should handle database errors properly', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      (prismaService.user.findUnique as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(dbError);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'newPassword123',
      role: UserRoles.user,
    };

    const newUser = {
      id: 3,
      username: 'newuser',
      email: 'newuser@example.com',
      role: UserRoles.user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully register new user', async () => {
      // Arrange
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedNewPassword' as never);
      (prismaService.user.create as jest.Mock).mockResolvedValue(newUser);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'newuser@example.com' },
            { username: 'newuser' }
          ]
        }
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword123', 12);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'hashedNewPassword',
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
      expect(result.user).toEqual(newUser);
    });

    it('should successfully register admin user', async () => {
      // Arrange
      const adminRegisterDto: RegisterDto = {
        username: 'newadmin',
        email: 'newadmin@example.com',
        password: 'adminPassword123',
        role: UserRoles.admin,
      };

      const newAdmin = {
        ...newUser,
        username: 'newadmin',
        email: 'newadmin@example.com',
        role: UserRoles.admin,
      };

      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedAdminPassword' as never);
      (prismaService.user.create as jest.Mock).mockResolvedValue(newAdmin);

      // Act
      const result = await service.register(adminRegisterDto);

      // Assert
      expect(result.user.role).toBe(UserRoles.admin);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newadmin@example.com',
          username: 'newadmin',
          password: 'hashedAdminPassword',
          role: UserRoles.admin,
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
    });

    it('should throw ConflictException when user already exists with same email', async () => {
      // Arrange
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'newuser@example.com' },
            { username: 'newuser' }
          ]
        }
      });
    });

    it('should throw ConflictException when user already exists with same username', async () => {
      // Arrange
      const existingUserWithSameUsername = { ...mockUser, email: 'different@email.com' };
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(existingUserWithSameUsername);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should handle password hashing errors', async () => {
      // Arrange
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      const hashError = new Error('Hashing failed');
      mockedBcrypt.hash.mockRejectedValue(hashError as never);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(hashError);
    });

    it('should handle database creation errors', async () => {
      // Arrange
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      const dbError = new Error('Database creation failed');
      (prismaService.user.create as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(dbError);
    });
  });
});
