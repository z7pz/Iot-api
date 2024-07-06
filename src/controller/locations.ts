import { prisma } from "../prisma";
import { Request, Response } from "express";
import z from "zod";

// 
export let s = {
	body: z.object({
		name: z.string().min(5),
	}),
} as const;

export const shema = z.object(s);

export async function getLocations(req: Request, res: Response) {
	let data = await prisma.user.findFirst({
		where: {
			id: req.user.id,
		},
		select: {
			locations: {
				include: {
					devices: true,
				},
			},
		},
	});
	res.send(data.locations || []);
}

export async function getNotification(req: Request, res: Response) {
	console.log( req.params.id);	
	let arr = await prisma.notification.findMany({
		"where": {
			locationId: req.params.id
		},
		
	})
	res.send(arr);
}

export async function createLocations(req: Request, res: Response) {
	let body = req.body;
	let newLocation = await prisma.location.create({
		data: {
			name: body.name,
			userId: req.user.id,
		},
	});
	res.send(newLocation);
}

export async function getLocation(req: Request, res: Response) {
	let id = req.params.id;
	let location = await prisma.location.findFirst({
		where: {
			id,
		},
		include: {
			devices: true,
		},
	});

	if (!location)
		return res.status(404).send({
			success: false,
			message: "location not found",
		});

	res.send(location);
}

export async function getDevices(req: Request, res: Response) {
	let devices = await prisma.connectedDevices.findMany();
	res.send(devices);
}

export async function attachDevice(req: Request, res: Response) {
	let location = await prisma.location.findFirst({
		where: {
			id: req.params.id,
			userId: req.user.id,
		},
		include: {
			devices: {
				include: {
					device: true,
				},
			},
		},
	});
	if (!location)
		return res.status(404).send({
			success: false,
			message: "location not found",
		});
	if (
		location.devices.map((c) => c.device.id).includes(req.params.deviceId)
	) {
		return res.send({
			success: false,
			message: "Device already connected to this location",
		});
	}

	let device = await prisma.connectedDevices.findFirst({
		where: {
			id: req.params.deviceId,
		},
	});
	if (!device)
		return res.status(404).send({
			success: false,
			message: "device not found",
		});

		let d = await prisma.device.create({
			data: {
				connectedDevicesId: device.id,
				locationId: location.id,
			},
			
		});
		await prisma.connectedDevices.update({
			where: {
				id: device.id,
			},
			"data": {
				'Device': {
					"connect": d
				}
			}
		});

	res.send("Attached!");
}

export async function getDeviceData(req: Request, res: Response) {
	let id = req.params.id;
	let location = await prisma.location.findFirst({
		where: {
			id,
		},
		include: {
			devices: true,
		},
	});

	if (!location)
		return res.status(404).send({
			success: false,
			message: "location not found",
		});

	let device = await prisma.connectedDevices.findFirst({
		where: {
			id: req.params.deviceId,
		},
		"take": 50,
		include: {
			Data: {
				"orderBy": {
					"createdAt": "desc"
				}
			},
		},
	});
	if (!device)
		return res.status(404).send({
			success: false,
			message: "device not found",
		});
	res.send(device.Data);
}
