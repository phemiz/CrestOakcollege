let db: any;

if (typeof window !== "undefined") {
  db = new Proxy({} as any, {
    get() {
      return () => Promise.resolve(null);
    },
  });
} else {
  const { PrismaClient } = require('@prisma/client');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');
  require('dotenv/config');

  const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    const prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    return prisma.$extends({
      query: {
        $allModels: {
          async findMany({ model, operation, args, query }: any) {
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
          async findFirst({ model, operation, args, query }: any) {
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
          async findUnique({ model, operation, args, query }: any) {
            return query(args);
          },
          async update({ model, operation, args, query }: any) {
            return query(args);
          },
        },
      },
    });
  };

  db = (globalThis as any).prismaGlobal ?? prismaClientSingleton();
  if (process.env.NODE_ENV !== 'production') (globalThis as any).prismaGlobal = db;
}

export default db;
