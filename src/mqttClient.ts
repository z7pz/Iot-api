import mqtt from "mqtt";
import admin from "firebase-admin";
import serviceAccount from "../hackathon-89524-firebase-adminsdk-mq9dh-21a22d3ae7.json";
import { prisma } from "./prisma";
import { intoData } from "./helpers/intoData";
import { between } from "./helpers/between";
import { Mq135Status } from "./helpers/constants";
import { intoMessage } from "./helpers/intoMessage";
import type { IData } from "./interfaces/Data";
import { Server } from "socket.io";
import { checkPrimeSync } from "crypto";

const USER_TOKEN =
	"e0-amaF8TJSB08PCb0QOs1:APA91bGeRexHZZYzFGjPECRy_-MFc0B-XHykK4kKTTCaBKYmKOlxStulVarQTHs0XNSx7qfAlBxtn3XKdmFQTaPfy2c5LsrIEFxsFQyOCdVCJ1LXY0mtTMSWG2QZnV7T0mP0lENODuUI";

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as any),
});
export class MqttClient {
	constructor(ip: string, port: number, io: Server) {
		let server = mqtt.connect(ip, {
			port: port,
		});

		server.subscribe("sensor/data");

		server.on("connect", () => {
			console.log("mqtt has been connected!");
		});

		server.on("disconnect", () => {
			console.log("mqtt has been disconnected!");
		});
		server.on("message", async (_topic, payload) => {
			let data = intoData(payload);
			console.log(data);
			let device = await prisma.connectedDevices.findFirst({
				where: {
					id: data.id,
				},
				include: {
					Device: {
						include: {
							Location: true,
						},
					},
				},
			});

			if (!device) {
				return await prisma.connectedDevices.create({
					data: {
						id: data.id,
					},
				});
			}

			let status = this.getmq135Status(data);

			let analytical_data = await prisma.data.create({
				data: {
					...data,
					id: undefined,
					connectedDevicesId: data.id,
					mq135_statys: status,
				},
			});
			console.log(analytical_data)
			

			
			io.emit(`data-${device.id}`, analytical_data);

			if ([Mq135Status.GOOD].includes(status)) {
				// do nothing
			} else {
				// send notification into the location's user
				for (let i = 0; i < device.Device.length; i++) {
					const location = device.Device[i].locationId;
					let message = intoMessage(analytical_data.mq135_statys);
					await this.sendNotificationToUser(`Warning air pollution is ${status.split("_").join(" ").toLowerCase()}`, message);
					await prisma.notification.create({
						data: {
							locationId: location,
							dataId: analytical_data.id,
							message: intoMessage(analytical_data.mq135_statys),
						},
					});
				}
			}
		});
	}
	async sendNotificationToUser(status: string, message: string) {
		try {
			await admin.messaging().send({
				notification: {
					title: status.split("_").join(" ").toLowerCase(),
					body: message,
				},
				token: USER_TOKEN,
			});
		} catch (err) {
			console.log("sending notification ERROR");
		}
	}
	getmq135Status(data: IData) {
		let status = Mq135Status.DANGEROUS;
		if (between(0, 50, true)(data.mq135_value)) {
			status = Mq135Status.GOOD;
		}
		if (between(51, 100, true)(data.mq135_value)) {
			status = Mq135Status.MODERATE;
		}
		if (between(101, 150, true)(data.mq135_value)) {
			status = Mq135Status.UNHEALTHY_FOR_SENSETIVE_PEOPLE;
		}
		if (data.mq135_value > 151) {
			status = Mq135Status.DANGEROUS;
		}
		return status;
	}
}
