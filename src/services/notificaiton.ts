import admin from "firebase-admin";
import serviceAccount from "../../hackathon-89524-firebase-adminsdk-mq9dh-21a22d3ae7.json";
import { emitNotification } from "../socket";
import { prisma } from "../prisma";

export type NotificationMessage = {
	title: string;
	description: string;
	status: string;
	dataId: string;
	locationId: string;
	userId: string;
	connectedDevicesId: string;
	token: string;
};

export interface NotificationObserver {
	notify(message: NotificationMessage): Promise<void>;
}

export class FirebaseNotificationObserver implements NotificationObserver {
	async notify(message: NotificationMessage): Promise<void> {
		if (message.token) {
			await admin.messaging().send({
				notification: {
					title: message.title,
					body: message.description,
				},
				token: message.token,
			});
		}
	}
}

export class SocketNotificationObserver implements NotificationObserver {
	async notify(message: NotificationMessage): Promise<void> {
		let notification = await prisma.notification.create({
			data: {
				locationId: message.locationId,
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
