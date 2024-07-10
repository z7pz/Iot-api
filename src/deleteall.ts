import { prisma } from "./prisma";
(async () => {
	await prisma.notification.deleteMany({})
})();
