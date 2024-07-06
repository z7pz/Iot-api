import { Data } from "@prisma/client";
import { Server } from "socket.io";

let io: Server;

export const socketConnection = () => {
	io = new Server(2020, {
		cors: {
			origin: "*",
		},
	});

	io.on("connect", () => {
		console.log("User has been connected!");
	});
	return io
};

export const emitData = (id: string, analytical_data: Data) => {
	io.emit(`data-${id}`, analytical_data);
};
