import Fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import authenticatePlugin from '../plugins/authenticate';
import { prisma } from '../db/prisma';
import { env } from './env';

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

  return fastify;
}

// Extend Fastify instance to include prisma
declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}
