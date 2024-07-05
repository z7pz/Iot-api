import { IData } from "../interfaces/Data";

export function intoData(payload: Buffer) {
	return JSON.parse(payload.toString()) as IData;
}
