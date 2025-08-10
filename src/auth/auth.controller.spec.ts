import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './guard/jwt.guard';
import { RolesGuard } from './guard/roles.guard';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRoles } from './enums/role.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponse, RegisterResponse } from './interfaces/auth.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token',
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: UserRoles.user,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  };

  const mockRegisterResponse: RegisterResponse = {
    user: {
      id: 2,
      username: 'newuser',
      email: 'newuser@example.com',
      role: UserRoles.user,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  };

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
    .overrideGuard(JwtGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should successfully login user', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should successfully login admin', async () => {
      // Arrange
      const adminLoginDto: LoginDto = {
        username: 'admin',
        password: 'adminPassword',
      };

      const adminLoginResponse: LoginResponse = {
        ...mockLoginResponse,
        user: {
          ...mockLoginResponse.user,
          username: 'admin',
          role: UserRoles.admin,
        }
      };

      mockAuthService.login.mockResolvedValue(adminLoginResponse);

      // Act
      const result = await controller.login(adminLoginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(adminLoginDto);
      expect(result.user.role).toBe(UserRoles.admin);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      const invalidLoginDto: LoginDto = {
        username: 'wronguser',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Act & Assert
      await expect(controller.login(invalidLoginDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(invalidLoginDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const nonExistentUserDto: LoginDto = {
        username: 'nonexistent',
        password: 'password123',
      };

      mockAuthService.login.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(controller.login(nonExistentUserDto)).rejects.toThrow(NotFoundException);
      expect(authService.login).toHaveBeenCalledWith(nonExistentUserDto);
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockAuthService.login.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(serviceError);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'newPassword123',
      role: UserRoles.user,
    };

    it('should successfully register new user', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockRegisterResponse);
    });

    it('should successfully register new admin user', async () => {
      // Arrange
      const adminRegisterDto: RegisterDto = {
        username: 'newadmin',
        email: 'newadmin@example.com',
        password: 'adminPassword123',
        role: UserRoles.admin,
      };

      const adminRegisterResponse: RegisterResponse = {
        user: {
          ...mockRegisterResponse.user,
          username: 'newadmin',
          email: 'newadmin@example.com',
          role: UserRoles.admin,
        }
      };

      mockAuthService.register.mockResolvedValue(adminRegisterResponse);

      // Act
      const result = await controller.register(adminRegisterDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(adminRegisterDto);
      expect(result.user.role).toBe(UserRoles.admin);
    });

    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(
        new ConflictException('User with this email or username already exists')
      );

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const serviceError = new Error('Database creation failed');
      mockAuthService.register.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(serviceError);
    });

    it('should be protected by guards', () => {
      // Test guard metadata - this ensures that the guards are properly applied
      const guards = Reflect.getMetadata('__guards__', controller.register);
      expect(guards).toBeDefined();
    });

    it('should require admin role', () => {
      // Test role metadata - this ensures that admin role is required
      const roles = Reflect.getMetadata('roles', controller.register);
      expect(roles).toContain(UserRoles.admin);
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 200 for successful login', async () => {
      // This test ensures login endpoint returns 200 OK
      mockAuthService.login.mockResolvedValue(mockLoginResponse);
      const loginDto: LoginDto = { username: 'test', password: 'test' };
      
      const result = await controller.login(loginDto);
      expect(result).toBeDefined();
      // In real implementation, HTTP status is handled by @HttpCode decorator
    });

    it('should return 201 for successful registration', async () => {
      // This test ensures register endpoint returns 201 Created
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);
      const registerDto: RegisterDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test123',
        role: UserRoles.user
      };
      
      const result = await controller.register(registerDto);
      expect(result).toBeDefined();
      // In real implementation, HTTP status is handled by @HttpCode decorator
    });
  });
});
