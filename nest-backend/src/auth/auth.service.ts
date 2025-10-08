import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto} from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
// import { Role, User } from 'src/users/entities/user.entity';
import { User, UserRole } from 'src/users/entities/user.entities';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  private async getTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email: email, role: role },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email: email, role: role },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashedToken = await this.hashData(refreshToken);
    await this.userRepository.update(userId, {
      hashedRefreshToken: hashedToken,
    });
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email: email, role: role },
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_SECRET',
        ),
        expiresIn: '1h',
      },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, email: email, role: role },
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_SECRET',
        ),
        expiresIn: '7d',
      },
    );
    return { accessToken, refreshToken };
  }

  async SignUp(createAuthDto: SignUpDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createAuthDto.email },
        select: ['userId'],
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }
      // Validate required fields
      if (!createAuthDto.first_name || !createAuthDto.last_name) {
        throw new BadRequestException('First name and last name are required');
      }
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
      
      const user = this.userRepository.create({
        email: createAuthDto.email,
        password: hashedPassword,
        role: createAuthDto.role as UserRole,
        
      });

      // generate tokens
      const savedUser = await queryRunner.manager.save(user);

      const { accessToken, refreshToken } = await this.generateTokens(
        savedUser.userId,
        savedUser.email,
        savedUser.role,
      );
      // Save refresh token in the database
      await this.saveRefreshToken(savedUser.userId, refreshToken);
      await queryRunner.commitTransaction();
      // Return user and tokens
      const userWithProfile = await this.userRepository.findOne({
        where: { userId: savedUser.userId },
        select: {
          userId: true,
          email: true,
          role: true,
          password: false, 
        },
      });
      return {
        user: userWithProfile,
        tokens: { accessToken, refreshToken },
        isAuthenticated: true,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async SignIn(loginDto: LoginDto) {
    const foundUser = await this.userRepository.findOne({
      where: { email: loginDto.email },
        select: {
          userId: true,
          email: true,
          role: true,
          password: true
        },
    });

    if (!foundUser) {
      throw new NotFoundException(
        `User with email ${loginDto.email} not found`,
      );
    }

    const foundPassword = await bcrypt.compare(
      loginDto.password,
      foundUser.password,
    );

    if (!foundPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.getTokens(
      foundUser.userId,
      foundUser.email,
      foundUser.role,
    );

    // Save refresh token in the database
    await this.saveRefreshToken(foundUser.userId, refreshToken);

    const { password, ...userWithoutPassword } = foundUser;

    // Return user and tokens
    return {
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken },
      isAuthenticated: true,
    };
  }

  async signOut(userId: number) {
    // set user refresh token to null
    const res = await this.userRepository.update(userId, {
      hashedRefreshToken: null,
    });

    if (res.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return { message: `User with id : ${userId} signed out successfully` };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const foundUser = await this.userRepository.findOne({
      where: { userId: userId },
      select: ['userId', 'email', 'hashedRefreshToken', 'role'], // Select only necessary fields
    });

    if (!foundUser) {
      throw new Error('User not found');
    }
    if (!foundUser.hashedRefreshToken) {
      throw new Error('Refresh token not found');
    }

    // Verify the refresh token
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      foundUser.hashedRefreshToken, // Assuming hashedRefreshToken is stored in the user entity
    );

    if (!isRefreshTokenValid) {
      throw new Error('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(
        foundUser.userId,
        foundUser.email,
        foundUser.role,
      );
    await this.saveRefreshToken(foundUser.userId, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
