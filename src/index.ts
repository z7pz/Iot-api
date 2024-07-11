import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { isLoggedIn } from "./middleware/auth";
import { socketConnection } from "./socket";
import { User } from "@prisma/client";
import { locationsRouter, userRouter, authRouter, publicRouter } from "./routers";
import { MqttClient, MqttClientFactory } from "./mqttClient";

// import { prisma } from "./prisma";
// (async () => {
// 	await prisma.notification.deleteMany({})
// })();

const app = express();
const io = socketConnection();
const mqtt = MqttClientFactory.create(
	process.env.MQTT_SERVER_IP,
	+process.env.MQTT_SERVER_PORT,
	io
);

app.use(
	cors({
		origin: process.env.CLIENT_URL,
	})
);

app.use(compression());
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", isLoggedIn(true), userRouter);
app.use("/locations", isLoggedIn(true), locationsRouter);
app.use("/public", isLoggedIn(false), publicRouter);

app.listen(process.env.PORT, () => {
	console.log("Server is running on port: " + process.env.PORT);
});

// todo create global types folder
declare module "express" {
	interface Request {
		user: User;
	}
}

declare module "socket.io" {
	interface Socket {
		user: User;

	}
}