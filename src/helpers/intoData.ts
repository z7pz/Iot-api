import { IData } from "../interfaces/Data";

export function intoData(payload: Buffer) {
	try {
		return JSON.parse(payload.toString()) as IData
	} catch(err) {
		return null;
	}
}
