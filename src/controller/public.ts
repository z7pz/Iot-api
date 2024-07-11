import { Request, Response } from "express";
import { PUBLIC_DEVICES } from "../helpers/constants";

export async function getPublicDevices(req: Request, res: Response) {
	res.send(PUBLIC_DEVICES);
}
