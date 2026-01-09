import Fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import authenticatePlugin from '../plugins/authenticate.js';
import { prisma } from '../db/prisma.js';
import { env } from './env.js';

export async function createFastifyApp(): Promise<FastifyInstance> {
  // Initialize Fastify with TypeBox type provider for full type inference
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Register CORS plugin
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Register JWT plugin for access tokens (15 minutes expiration)
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: '15m',
    },
  });

  // Register JWT plugin for refresh tokens (7 days expiration)
  // Using namespace to avoid conflicts with access token JWT
  await fastify.register(fastifyJwt, {
    secret: env.JWT_REFRESH_SECRET,
    namespace: 'refresh',
    jwtSign: 'refreshSign',
    jwtVerify: 'refreshVerify',
    sign: {
      expiresIn: '7d',
    },
  });

  // Register authentication plugin (adds authenticate decorator)
  await fastify.register(authenticatePlugin);

  // Register Swagger plugin - generates OpenAPI spec from route schemas
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Habit Tracker API',
        description: 'REST API for tracking daily habits and consistency metrics',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Habits', description: 'Habit CRUD operations' },
        { name: 'Tracking', description: 'Habit completion tracking' },
        { name: 'Goals', description: 'Habit goals and progress' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT token from /auth/login or /auth/signup',
          },
        },
      },
    },
  });

  // Register Swagger UI - serves the documentation interface
  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });

  // Decorate fastify instance with PrismaClient for easy access in routes
  fastify.decorate('prisma', prisma);

  // Register global error handler
  fastify.setErrorHandler((error: any, request, reply) => {
    fastify.log.error(error);

    if (error.validation) {
      return reply.code(400).send({
        statusCode: 400,
        message: 'Validation Error',
        validation: error.validation,
      });
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    return reply.code(statusCode).send({
      statusCode,
      message,
    });
  });

  // Register lifecycle hooks
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  // Health check endpoint for Render and monitoring
  fastify.get('/health', async (request, reply) => {
    try {
      // Verify database connection
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
      });
    } catch (error) {
      fastify.log.error(error, 'Health check failed');
      return reply.code(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      });
    }
  });

  return fastify;
}

// Extend Fastify instance to include prisma
declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}
