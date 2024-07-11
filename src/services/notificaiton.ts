import admin from "firebase-admin";
import serviceAccount from "../../hackathon-89524-firebase-adminsdk-mq9dh-21a22d3ae7.json";
import { emitNotification } from "../socket";
import { prisma } from "../prisma";
import { Location } from "@prisma/client";

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as any),
});


export type NotificationMessage = {
	title: string;
	description: string;
	status: string;
	dataId: string;
	location: Location;
	userId: string;
	connectedDevicesId: string;
	token: string;
};

export interface NotificationObserver {
	notify(message: NotificationMessage): Promise<void>;
	id(): string
}

export class FirebaseNotificationObserver implements NotificationObserver {
	async notify(message: NotificationMessage): Promise<void> {
		if (message.token) {
			try {
				await admin.messaging().send({
					notification: {
						title: message.location.id,
						body: message.title,
					},
					token: message.token,
				});
			} catch(err) {
				// console.log("Token is invalid")
			}
		}
	}
	id() {return "firebase"}
}

export class SocketNotificationObserver implements NotificationObserver {
	async notify(message: NotificationMessage): Promise<void> {
		let notification = await prisma.notification.create({
			data: {
				locationId: message.location.id,
				dataId: message.dataId,
				userId: message.userId,
				connectedDevicesId: message.connectedDevicesId,
				title: message.title,
				description: message.description,
				status: message.status,
			},
			include: {
				location: true,
			},
		});
		emitNotification(message.userId, "notification", notification);
	}
	id() {return "socket"}
}


export class NotificationService {
	private observers: NotificationObserver[] = [];

	addObserver(observer: NotificationObserver) {
		this.observers.push(observer);
	}

	async notifyAll(message: NotificationMessage) {
		await Promise.all(
			this.observers.map((observer) => observer.notify(message))
		);
	}
}
