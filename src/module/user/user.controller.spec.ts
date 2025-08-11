import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRoles } from '../../common/enums/user.enum';
import { CreateUserRequest } from './dto/create-user-request.dto';

describe('UserController - Unit Tests', () => {
  let controller: UserController;
  let userService: any;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: UserRoles.user,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockCreateUserResponse = {
    user: mockUser
  };

  const mockGetAllUsersResponse = [
    { user: mockUser },
    {
      user: {
        id: 2,
        username: 'admin',
        email: 'admin@example.com',
        role: UserRoles.admin,
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
      }
    }
  ];

  beforeEach(async () => {
    const mockUserService = {
      getAllUsers: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      userService.getAllUsers.mockResolvedValue(mockGetAllUsersResponse);

      const result = await controller.getAllUsers();

      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockGetAllUsersResponse);
    });

    it('should return empty array when no users exist', async () => {
      userService.getAllUsers.mockResolvedValue([]);

      const result = await controller.getAllUsers();

      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Database connection failed');
      userService.getAllUsers.mockRejectedValue(error);

      await expect(controller.getAllUsers()).rejects.toThrow('Database connection failed');
      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    const createUserDto: CreateUserRequest = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'password123',
      role: UserRoles.user,
    };

    it('should create a new user successfully', async () => {
      userService.createUser.mockResolvedValue(mockCreateUserResponse);

      const result = await controller.createUser(createUserDto);

      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreateUserResponse);
    });

    it('should create an admin user', async () => {
      const adminUserDto: CreateUserRequest = {
        ...createUserDto,
        role: UserRoles.admin,
      };
      
      const adminResponse = {
        user: {
          ...mockUser,
          role: UserRoles.admin,
        }
      };

      userService.createUser.mockResolvedValue(adminResponse);

      const result = await controller.createUser(adminUserDto);

      expect(userService.createUser).toHaveBeenCalledWith(adminUserDto);
      expect(result).toEqual(adminResponse);
    });

    it('should propagate service errors', async () => {
      const error = new Error('User already exists');
      userService.createUser.mockRejectedValue(error);

      await expect(controller.createUser(createUserDto)).rejects.toThrow('User already exists');
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('Controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have userService injected', () => {
      expect(userService).toBeDefined();
    });
  });
});