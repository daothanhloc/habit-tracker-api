import { createFastifyApp } from './config/fastify.js';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import habitRoutes from './routes/habits.js';
import trackingRoutes from './routes/tracking.js';
import goalRoutes from './routes/goals.js';

async function start() {
  try {
    const fastify = await createFastifyApp();

    // Register routes
    await fastify.register(authRoutes, { prefix: '/auth' });
    await fastify.register(habitRoutes, { prefix: '/habits' });
    await fastify.register(trackingRoutes, { prefix: '/habits' });
    await fastify.register(goalRoutes, { prefix: '/habits' });

    // Start server
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });

    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${env.PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
