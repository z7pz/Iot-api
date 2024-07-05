import "dotenv/config";
import express from "express";
import cors, { CorsOptions } from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { authRouter } from "./routers/auth";
import { isLoggedIn } from "./middleware/auth";
import { Server } from "socket.io";
import mqtt from "mqtt";
import { prisma } from "./prisma";
import { intoData } from "./helpers/intoData";
import { User } from "@prisma/client";
import { userRouter } from "./routers/user";
import { locationsRouter } from "./routers/locations";

declare module "express" {
	interface Request {
		user: User;
	}
}

const app = express();

const corsConfig: CorsOptions = {
	origin: "*",
};

const io = new Server(2020, {
	cors: corsConfig,
});

app.use(cors(corsConfig));
app.use(compression());
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

app.use(express.json());

app.use("/auth", isLoggedIn(false), authRouter);
app.use("/user", isLoggedIn(true), userRouter);
app.use("/locations", isLoggedIn(true), locationsRouter);

app.listen(process.env.PORT, () => {
	console.log("Server is running on port: " + process.env.PORT);
});

let server = mqtt.connect("mqtt://46.101.128.142", {
	port: 1883,
});

server.on("connect", (_packet) => {
	console.log("mqtt has been connected!");
});

server.on("disconnect", (_packet) => {
	console.log("mqtt has been disconnected!");
});

const between = function (a, b, inclusive) {
	return (n) => {
		var min = Math.min(a, b),
			max = Math.max(a, b);

		return inclusive ? n >= min && n <= max : n > min && n < max;
	};
};

enum Mq135Status {
	GOOD = "GOOD",
	MODERATE = "MODERATE",
	UNHEALTHY_FOR_SENSETIVE_PEOPLE = "UNHEALTHY_FOR_SENSETIVE_PEOPLE",
	DANGEROUS = "DANGEROUS",
}

server.on("message", async (topic, payload, packet) => {
	let data = intoData(payload);
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
		await prisma.connectedDevices.create({
			data: {
				id: data.id,
			},
		});
	}

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

	let analytical_data = await prisma.data.create({
		data: {
			...data,
			id: undefined,
			connectedDevicesId: data.id,
			mq135_statys: status,
		},
	});
	console.log(analytical_data);
	io.emit(`data-${device.id}`, analytical_data);
});
io.on("connect", () => {
	console.log("User has been connected!");
});

server.subscribe("sensor/data");

// data-connectedDevicesId