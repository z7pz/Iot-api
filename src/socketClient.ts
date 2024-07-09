import { Data } from "@prisma/client";
import { verifyToken } from "./helpers/jwt";
import { Server, Socket } from "socket.io";

const PUBLICDEVICEIDS = [];

let io: Server;

const authenticate = (socket: Socket, next: (err?: Error) => void) => {
	// Applications often use tokens in auth, but postman does not support it
	const token =
		socket.handshake.auth?.token || socket.handshake.headers?.token;

	// TODO create more checks if it's actuall in the database

	if (!token) {
		console.log("Unauthorized");
		return next(new Error("Unauthorized"));
	}
	let res = verifyToken(token);
	if (res.success) return next();
	else {
		console.log("Unauthorized");
		return next(new Error("Unauthorized"));
	}
};

export const socketConnection = () => {
	io = new Server(2020, {
		cors: {
			origin: process.env.CLIENT_URL,
		},
	});

	// // Public namespace
	// const publicNamespace = io.of("/");
	// publicNamespace.on("connection", (socket) => {
	// 	socket.on("disconnect", () => {
	// 		console.log("User disconnected from public namespace");
	// 	});
	// });

	// Private namespace
	const privateNamespace = io.of(/^\/devices\/.+$/);
	privateNamespace.use(authenticate); // Apply authentication middleware
	privateNamespace.on("connection", (socket) => {
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
	return io;
};

export const emitToDevices = (deviceId: string, event: string, data: Data) => {
	const namespace = `/devices/${deviceId}`;
	const targetNamespace = io.of(namespace);
	targetNamespace.to(deviceId).emit(event, data);
};
