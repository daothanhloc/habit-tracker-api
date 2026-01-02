import { PrismaClient } from '@prisma/client';

// Singleton pattern for PrismaClient to avoid multiple connections
// Critical for connection pooling and performance
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
