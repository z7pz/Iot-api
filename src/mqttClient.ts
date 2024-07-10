import mqtt from "mqtt";
import admin from "firebase-admin";
import serviceAccount from "../hackathon-89524-firebase-adminsdk-mq9dh-21a22d3ae7.json";
import { prisma } from "./prisma";
import { intoData } from "./helpers/intoData";
import { between } from "./helpers/between";
import { EAQIStatus } from "./helpers/constants";
import { intoMessage } from "./helpers/intoMessage";
import { Server } from "socket.io";
import { emitNotification, emitToDevices } from "./socketClient";

const USER_TOKEN =
	"e0-amaF8TJSB08PCb0QOs1:APA91bGeRexHZZYzFGjPECRy_-MFc0B-XHykK4kKTTCaBKYmKOlxStulVarQTHs0XNSx7qfAlBxtn3XKdmFQTaPfy2c5LsrIEFxsFQyOCdVCJ1LXY0mtTMSWG2QZnV7T0mP0lENODuUI";

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as any),
});
export class MqttClient {
	constructor(ip: string, port: number, public io: Server) {
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
			let device = await prisma.connectedDevices.findFirst({
				where: {
					id: data.id,
				},
				include: {
					devices: {
						include: {
							location: {
								include: {
									user: true,
								},
							},
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

			let status = this.getEAQIStatus(data.AQI);

			let processedData = await prisma.data.create({
				data: {
					id: undefined,
					AQI: data.AQI,
					humidity: data.humidity,
					dustPercentage: data.dust_percentage,
					temperatureC: data.temperature_c,
					temperatureF: data.temperature_f,
					AQIStatus: status,
					connectedDevice: {
						connect: {
							id: data.id,
						},
					},
				},
			});

			// TODO you can combind both in one loop
			console.log(processedData);
			for (let i = 0; i < device.devices.length; i++) {
				const { id } = device.devices[i];
				emitToDevices(id, "data", processedData);
			}

			if (![EAQIStatus.GOOD].includes(status)) {
				for (let i = 0; i < device.devices.length; i++) {
					const location = device.devices[i].location;
					let message = {
						title: `Warning air pollution is ${status
							.split("_")
							.join(" ")
							.toLowerCase()}`,
						description: "Warning air pollution",
						status: status.split("_").join(" "),
					};
					await this.sendNotification({
						message,
						dataId: processedData.id,
						locationId: location.id,
						userId: location.user.id,
						connectedDevicesId: device.id,
						token: location.user.token
					});
				}
			}
		});
	}
	async sendNotification({
		message,
		locationId,
		dataId,
		userId,
		connectedDevicesId,
		token
	}: {
		message: { title: string; description: string; status: string };
		locationId: string;
		dataId: string;
		userId: string;
		connectedDevicesId: string;
		token: string | null,
	}) {
		if(token) {
			console.log("Sending notification using firebase")
			await this.sendNotificationToUser(message.title, message.description, token);
		}
		let notification = await prisma.notification.create({
			data: {
				locationId,
				dataId,
				userId,
				connectedDevicesId,
				title: message.title,
				description: message.description,
				status: message.status,
			},
		});
		console.log("Sending notification using socket.io")
		emitNotification(userId, "notification", notification)
	}
	async sendNotificationToUser(status: string, message: string, token: string) {
		try {
			await admin.messaging().send({
				notification: {
					title: status.split("_").join(" ").toLowerCase(),
					body: message,
				},
				token,
			});
		} catch (err) {
			console.log("sending notification ERROR");
		}
	}
	getEAQIStatus(aqi: number) {
		let status = EAQIStatus.DANGEROUS;
		if (between(0, 50, true)(aqi)) {
			status = EAQIStatus.GOOD;
		}
		if (between(51, 100, true)(aqi)) {
			status = EAQIStatus.MODERATE;
		}
		if (between(101, 150, true)(aqi)) {
			status = EAQIStatus.UNHEALTHY_FOR_SENSETIVE_PEOPLE;
		}
		if (aqi > 151) {
			status = EAQIStatus.DANGEROUS;
		}
		return status;
	}
}
