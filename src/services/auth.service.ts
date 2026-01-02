import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new user with hashed password
   * @throws Error if user already exists (will be caught as P2002 by Prisma)
   */
  async signup(email: string, password: string, name?: string) {
    // Hash password with 10 salt rounds (~65ms)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Password is not selected, so not returned
    return user;
  }

  /**
   * Validate user credentials for login
   * @returns User without password if valid, null if invalid
   */
  async validateCredentials(email: string, password: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Return user without password - use select to fetch without password
    const userWithoutPassword = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return userWithoutPassword;
  }

  /**
   * Store refresh token in database
   */
  async storeRefreshToken(userId: string, token: string, expiresAt: Date) {
    return await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Validate refresh token and return userId if valid
   * @returns userId if token is valid and not expired, null otherwise
   */
  async validateRefreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      return null;
    }

    // Check if token is expired
    if (refreshToken.expiresAt < new Date()) {
      // Delete expired token
      await this.prisma.refreshToken.delete({
        where: { token },
      });
      return null;
    }

    return refreshToken.userId;
  }

  /**
   * Revoke (delete) a specific refresh token
   */
  async revokeRefreshToken(token: string) {
    try {
      await this.prisma.refreshToken.delete({
        where: { token },
      });
      return true;
    } catch (error) {
      // Token doesn't exist, that's fine
      return false;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get user by ID (without password)
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}
