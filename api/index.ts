import { createFastifyApp } from '../src/config/fastify.js';
import authRoutes from '../src/routes/auth.js';
import goalRoutes from '../src/routes/goals.js';
import habitRoutes from '../src/routes/habits.js';
import taskRoutes from '../src/routes/tasks.js';

let app: any = null;

async function build() {
  if (app) return app;

  const fastify = await createFastifyApp();

  // Register routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(goalRoutes, { prefix: '/goals' });
  await fastify.register(habitRoutes);
  await fastify.register(taskRoutes);

  await fastify.ready();
  app = fastify;
  return app;
}

export default async function handler(req: any, res: any) {
  await build();
  app.server.emit('request', req, res);
}
