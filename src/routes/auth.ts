import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Static } from '@sinclair/typebox';
import {
  SignupSchema,
  LoginSchema,
  RefreshTokenSchema,
  LogoutSchema,
  AuthResponseSchema,
  TokenRefreshResponseSchema,
  type SignupDto,
  type LoginDto,
  type RefreshTokenDto,
  type LogoutDto,
} from '../schemas/auth.schema.js';
import { AuthService } from '../services/auth.service.js';

// Auth routes - signup, login, refresh, logout
const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const authService = new AuthService(fastify.prisma);

  // POST /auth/signup - User registration
  fastify.post<{
    Body: SignupDto;
    Reply: Static<typeof AuthResponseSchema>;
  }>(
    '/signup',
    {
      schema: {
        tags: ['Auth'],
        summary: 'User signup',
        description: 'Register a new user account',
        body: SignupSchema,
        response: {
          201: AuthResponseSchema,
          400: { description: 'User already exists' },
        },
      } as any,
    },
    async (request, reply) => {
      try {
        const { email, password, name } = request.body;

        // Create user (password will be hashed in service)
        const user = await authService.signup(email, password, name);

        // Sign access token with user payload (15 minutes)
        const accessToken = fastify.jwt.sign({
          userId: user.id,
          email: user.email,
        });

        // Sign refresh token (7 days)
        const refreshToken = fastify.jwt.sign(
          { userId: user.id },
          { expiresIn: '7d' }
        );

        // Store refresh token in database for revocation capability
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await authService.storeRefreshToken(user.id, refreshToken, expiresAt);

        return reply.code(201).send({
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          },
        });
      } catch (error: any) {
        // Handle Prisma unique constraint violation (user already exists)
        if (error.code === 'P2002') {
          return reply.code(400).send({
            message: 'User with this email already exists',
          } as any);
        }
        throw error;
      }
    }
  );

  // POST /auth/login - User authentication
  fastify.post<{
    Body: LoginDto;
    Reply: Static<typeof AuthResponseSchema>;
  }>(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'User login',
        description: 'Authenticate user and return tokens',
        body: LoginSchema,
        response: {
          200: AuthResponseSchema,
          401: { description: 'Invalid credentials' },
        },
      } as any,
    },
    async (request, reply) => {
      const { email, password } = request.body;

      // Validate credentials
      const user = await authService.validateCredentials(email, password);

      if (!user) {
        return reply.code(401).send({
          message: 'Invalid email or password',
        } as any);
      }

      // Sign access token with user payload (15 minutes)
      const accessToken = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
      });

      // Sign refresh token (7 days)
      const refreshToken = fastify.jwt.sign(
        { userId: user.id },
        { expiresIn: '7d' }
      );

      // Store refresh token in database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authService.storeRefreshToken(user.id, refreshToken, expiresAt);

      return reply.send({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      });
    }
  );

  // POST /auth/refresh - Refresh access token
  fastify.post<{
    Body: RefreshTokenDto;
    Reply: Static<typeof TokenRefreshResponseSchema>;
  }>(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description:
          'Get new access and refresh tokens using a valid refresh token',
        body: RefreshTokenSchema,
        response: {
          200: TokenRefreshResponseSchema,
          401: { description: 'Invalid or expired refresh token' },
        },
      } as any,
    },
    async (request, reply) => {
      const { refreshToken } = request.body;

      try {
        // Verify refresh token signature
        const decoded = fastify.jwt.verify(refreshToken) as {
          userId: string;
        };

        // Check if refresh token exists in database (not revoked)
        const userId = await authService.validateRefreshToken(refreshToken);

        if (!userId || userId !== decoded.userId) {
          return reply.code(401).send({
            message: 'Invalid or revoked refresh token',
          } as any);
        }

        // Get user details
        const user = await authService.getUserById(userId);

        if (!user) {
          return reply.code(401).send({
            message: 'User not found',
          } as any);
        }

        // Revoke old refresh token (token rotation)
        await authService.revokeRefreshToken(refreshToken);

        // Sign new access token
        const newAccessToken = fastify.jwt.sign({
          userId: user.id,
          email: user.email,
        });

        // Sign new refresh token
        const newRefreshToken = fastify.jwt.sign(
          { userId: user.id },
          { expiresIn: '7d' }
        );

        // Store new refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await authService.storeRefreshToken(
          user.id,
          newRefreshToken,
          expiresAt
        );

        return reply.send({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        return reply.code(401).send({
          message: 'Invalid refresh token',
        } as any);
      }
    }
  );

  // POST /auth/logout - Revoke refresh token
  fastify.post<{
    Body: LogoutDto;
  }>(
    '/logout',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        summary: 'User logout',
        description: 'Revoke refresh token to log out user',
        body: LogoutSchema,
        response: {
          204: { description: 'Successfully logged out' },
          401: { description: 'Unauthorized' },
        },
      } as any,
    },
    async (request, reply) => {
      const { refreshToken } = request.body;

      // Revoke the refresh token
      await authService.revokeRefreshToken(refreshToken);

      return reply.code(204).send();
    }
  );
};

export default authRoutes;
