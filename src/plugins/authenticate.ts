import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Authentication plugin that adds an authenticate decorator to Fastify
 * This decorator can be used in route onRequest hooks to protect routes
 */
const authenticatePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        // Verify JWT token - this will throw if token is invalid
        await request.jwtVerify();
        // Token payload is now available in request.user
      } catch (err) {
        reply.code(401).send({
          statusCode: 401,
          message: 'Unauthorized - Invalid or missing token',
        });
      }
    }
  );
};

// Export as a Fastify plugin using fastify-plugin
// This ensures the decorator is available globally
export default fp(authenticatePlugin, {
  name: 'authenticate',
});
