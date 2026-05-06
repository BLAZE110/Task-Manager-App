const { PrismaClient } = require('@prisma/client');

// Singleton pattern to prevent multiple Prisma instances in development
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: [], // No logging in production
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
