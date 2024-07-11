import { Router } from "express";
import { getPublicDevices } from "../controller/public";

const publicRouter = Router();

publicRouter.get("/devices", getPublicDevices);

export { publicRouter };
