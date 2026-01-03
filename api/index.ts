import { createFastifyApp } from '../src/config/fastify';
import authRoutes from '../src/routes/auth';
import habitRoutes from '../src/routes/habits';
import trackingRoutes from '../src/routes/tracking';
import goalRoutes from '../src/routes/goals';

let app: any = null;

async function build() {
  if (app) return app;

  const fastify = await createFastifyApp();

  // Register routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(habitRoutes, { prefix: '/habits' });
  await fastify.register(trackingRoutes, { prefix: '/habits' });
  await fastify.register(goalRoutes, { prefix: '/habits' });

  await fastify.ready();
  app = fastify;
  return app;
}

export default async function handler(req: any, res: any) {
  await build();
  app.server.emit('request', req, res);
}
