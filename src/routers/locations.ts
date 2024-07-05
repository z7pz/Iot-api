import { Router } from "express";
import {
	attachDevice,
	createLocations,
	getDeviceData,
	getDevices,
	getLocation,
	getLocations,
	s,
} from "../controller/locations";
import { validateRequest } from "zod-express-middleware";
const locationsRouter = Router();

locationsRouter.get("/", getLocations);
locationsRouter.get("/devices", getDevices);
locationsRouter.get("/:id", getLocation);
locationsRouter.get("/:id/:deviceId", getDeviceData);

locationsRouter.post("/:id/:deviceId", attachDevice);
locationsRouter.post("/", validateRequest(s), createLocations);

export { locationsRouter };
