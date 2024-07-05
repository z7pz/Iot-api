import { IUser } from "interfaces/global";
import express from "express";
import "dotenv/config";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { authRouter } from "./routers/auth";
import { isLoggedIn } from "./middleware/auth";
import { Server } from "socket.io";
const app = express();

app.use(cors({ origin: "*" }));
app.use(compression());
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

app.use(express.json());
declare module "express" {
	interface Request {
		user: IUser;
	}
}
app.use("/auth", isLoggedIn(false), authRouter);
import http from "http";
app.listen(process.env.PORT, () => {
	console.log("Server is running on port: " + process.env.PORT);
});

import mqtt from "mqtt";
import { prisma } from "./prisma";

let server2 = mqtt.connect("mqtt://46.101.128.142", {
	port: 1883,
});

server2.on("connect", (packet) => {});
console.log("connected");

server2.on("disconnect", (packet) => {
	console.log("disconnected");
});

interface IData {
	id: string;
	humidity: number;
	temperature_c: number;
	temperature_f: number;
	mq135_value: number;
	dust_concentration: number;
}

function intoData(payload: Buffer) {
	return JSON.parse(payload.toString()) as IData;
}

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


const io = new Server(2020, {
	"cors": {
		"origin": "*"	
	}
});


server2.on("message", async (topic, payload, packet) => {
	let data = intoData(payload);
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

	console.log(data);
	let analytical_data = await prisma.data.create({
		data: {
			...data,
			id: undefined,
			mq135_statys: status,
		},
	});
	io.emit("data", analytical_data);
});
io.on("connect", () => {
	console.log("User has been connected!");
})


server2.subscribe("sensor/data");
