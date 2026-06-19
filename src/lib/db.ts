import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Prisma Client Extension for Soft Delete Filtering
  // This automatically intercepts queries and adds isDeleted: false filters.
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) {
          const modelsWithoutSoftDelete = ['RolePermission', 'ProgrammeCourse', 'AuditLog'];
          if (!modelsWithoutSoftDelete.includes(model)) {
            const anyArgs = args as any;
            if (anyArgs.where) {
              if (anyArgs.where.isDeleted === undefined) {
                anyArgs.where = { ...anyArgs.where, isDeleted: false };
              }
            } else {
              anyArgs.where = { isDeleted: false };
            }
          }
          return query(args);
        },
        async findFirst({ model, operation, args, query }) {
          const modelsWithoutSoftDelete = ['RolePermission', 'ProgrammeCourse', 'AuditLog'];
          if (!modelsWithoutSoftDelete.includes(model)) {
            const anyArgs = args as any;
            if (anyArgs.where) {
              if (anyArgs.where.isDeleted === undefined) {
                anyArgs.where = { ...anyArgs.where, isDeleted: false };
              }
            } else {
              anyArgs.where = { isDeleted: false };
            }
          }
          return query(args);
        },
        async findUnique({ model, operation, args, query }) {
          return query(args);
        },
        async update({ model, operation, args, query }) {
          return query(args);
        },
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;
