import { Request, Response } from "express";
import { prisma } from "../prisma";

export async function getUser(req: Request, res: Response) {
	let data = await prisma.user.findFirst({
		where: {
			id: req.user.id,
		},
		include: {
			locations: true,
			notifications: {
				include: {
					location: true,
				},
			},
		},
	});
	let s = data.notifications
	res.send({ ...data, password: undefined, email: undefined });
}
