import { createFastifyApp } from './config/fastify.js';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import goalRoutes from './routes/goals.js';
import habitRoutes from './routes/habits.js';
import taskRoutes from './routes/tasks.js';

async function start() {
  try {
    const fastify = await createFastifyApp();

    // Register routes. goalRoutes is prefixed; habitRoutes/taskRoutes
    // define absolute paths themselves (they mix /goals/:goalId/habits
    // and /habits/:habitId/... under one plugin each).
    await fastify.register(authRoutes, { prefix: '/auth' });
    await fastify.register(goalRoutes, { prefix: '/goals' });
    await fastify.register(habitRoutes);
    await fastify.register(taskRoutes);

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
