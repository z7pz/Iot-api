import mqtt from "mqtt";
import admin from "firebase-admin";
import serviceAccount from "../hackathon-89524-firebase-adminsdk-mq9dh-21a22d3ae7.json";
import { prisma } from "./prisma";
import { intoData } from "./helpers/intoData";
import { Server } from "socket.io";
import { emitToDevices, emitToPublicDevices } from "./socket";
import {
	AQIStrategy,
	DefaultAQIStrategy,
	EAQIStatus,
} from "./strategies/AQIStrategy";
import {
	FirebaseNotificationObserver,
	NotificationService,
	SocketNotificationObserver,
} from "services/notificaiton";
import { PUBLIC_DEVICES } from "helpers/constants";

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as any),
});

export class MqttClientFactory {
	static create(ip: string, port: number, io: Server): MqttClient {
		return new MqttClient(
			ip,
			port,
			io,
			new DefaultAQIStrategy(),
			new NotificationService()
		);
	}
}

export class MqttClient {
	private server: mqtt.MqttClient;

	constructor(
		ip: string,
		port: number,
		private _io: Server,
		private aqiStrategy: AQIStrategy,
		private notificationService: NotificationService
	) {
		const firebaseObserver = new FirebaseNotificationObserver();
		const socketObserver = new SocketNotificationObserver();

		notificationService.addObserver(firebaseObserver);
		notificationService.addObserver(socketObserver);

		this.server = mqtt.connect(ip, { port });

		this.server.subscribe("sensor/data");

		this.server.on("connect", this.handleConnect.bind(this));

		this.server.on("disconnect", this.handleDisconnect.bind(this));
		this.server.on("message", this.handleMessage.bind(this));
	}
	private handleConnect() {
		console.log("mqtt has been connected!");
	}
	private handleDisconnect() {
		console.log("mqtt has been disconnected!");
	}
	private async handleMessage(_, payload: Buffer) {
		let data = intoData(payload);
		if(!data) return console.warn("Error while validation the payload")
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

		let status = this.aqiStrategy.getStatus(data.AQI);

		let processedData = await prisma.data.create({
			data: {
				id: undefined,
				AQI: data.AQI,
				humidity: data.humidity,
				dustPercentage: data.dust_percentage,
				temperatureC: data.temperature_c,
				temperatureF: data.temperature_f,
				AQIStatus: status.toString(),
				connectedDevice: {
					connect: {
						id: data.id,
					},
				},
			},
		});

		if (PUBLIC_DEVICES.includes(device.id)) {
			emitToPublicDevices(device.id, "data", processedData);
		}

		device.devices.forEach(({ id }) => {
			emitToDevices(id, "data", processedData);
		});

		if (![EAQIStatus.GOOD].includes(status)) {
			await Promise.all(
				device.devices.map(async ({ location }) => {
					await this.notificationService.notifyAll({
						title: `Warning air pollution is ${status
							.split("_")
							.join(" ")
							.toLowerCase()}`,
						description: "Warning air pollution",
						status: status.split("_").join(" "),
						dataId: processedData.id,
						locationId: location.id,
						userId: location.user.id,
						connectedDevicesId: device.id,
						token: location.user.token,
					});

					// 	message,
					// 	dataId: processedData.id,
					// 	locationId: location.id,
					// 	userId: location.user.id,
					// 	connectedDevicesId: device.id,
					// 	token: location.user.token,
					// });
				})
			);
		}
	}
}
