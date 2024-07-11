import { Data, Notification } from "@prisma/client";
import { getUserFromToken } from "./helpers/jwt";
import { Server, Socket } from "socket.io";

let io: Server;

const authenticate = async (socket: Socket, next: (err?: Error) => void) => {
	// Applications often use tokens in auth, but postman does not support it
	const token =
		socket.handshake.auth?.token || socket.handshake.headers?.token;


	if (!token) {
		return next(new Error("Unauthorized"));
	}
	let user = await getUserFromToken(token);
	if (user) {
		// @ts-ignore
		socket.user = user
		next()
	}
	else {
		return next(new Error("Unauthorized"));
	}
};

export const socketConnection = () => {
	io = new Server(+process.env.SOCKET_PORT, {
		cors: {
			origin: "*", // TODO CLIENT_URL
		},
	});

	const publicNamespace = io.of(/^\/publicDevices\/.+$/);
	publicNamespace.on("connection", (socket) => {
		const deviceId = socket.nsp.name.split("/").pop();
		socket.join(deviceId);
		
		socket.on("data", (data) => {
			console.log(`Public event received in ${deviceId}:`, data);
			socket.to(deviceId).emit("data", data); 
		});

		socket.on("disconnect", () => {
			console.log("User disconnected from public namespace");
		});
	});
	const devicesNamespace = io.of(/^\/devices\/.+$/);
	devicesNamespace.use(authenticate); 
	devicesNamespace.on("connection", (socket) => {
		const deviceId = socket.nsp.name.split("/").pop();
		console.log(
			`A user connected to private namespace for deviceId: ${deviceId}`
		);

		socket.join(deviceId);

		socket.on("data", (data) => {
			console.log(`Private event received in ${deviceId}:`, data);
			socket.to(deviceId).emit("data", data); // Emit to all clients in the room
		});

		socket.on("disconnect", () => {
			console.log(
				`User disconnected from private namespace for deviceId: ${deviceId}`
			);
		});
	});

	const privateNamespace = io.of("notifications");
	privateNamespace.use(authenticate); // Apply authentication middleware
	privateNamespace.on("connection", (socket) => {

		socket.join(socket.user.id)

		socket.on("notification", (data) => {
			socket.to(socket.user.id).emit("notification", data); 
		});

		socket.on("disconnect", () => {
			console.log(
				`notifcations connected!`
			);
		});
	});
	return io;
};

export const emitToDevices = (deviceId: string, event: string, data: Data) => {
	const namespace = `/devices/${deviceId}`;
	const targetNamespace = io.of(namespace);
	targetNamespace.to(deviceId).emit(event, data);
};

export const emitToPublicDevices = (deviceId: string, event: string, data: Data) => {
	const namespace = `/publicDevices/${deviceId}`;
	const targetNamespace = io.of(namespace);
	targetNamespace.to(deviceId).emit(event, data);
};



export const emitNotification = (userId: string, event: string, data: Notification) => {
	const namespace = `/notifications`;
	const targetNamespace = io.of(namespace);
	targetNamespace.to(userId).emit(event, data);
};
