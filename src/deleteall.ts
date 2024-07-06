import { prisma } from "./prisma";
(async () => {
	prisma.$executeRaw(`TRUNCATE TABLE "data" RESTART IDENTITY CASCADE;` as any)
})();
