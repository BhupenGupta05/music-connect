// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // For Prisma CLI commands (db push, migrate, etc.) → use DIRECT / UNPOOLED
    url: env("DATABASE_URL"),
  },
});