import { decryptAes } from "../test";
import { IData } from "../interfaces/Data";

export function intoData(payload: Buffer) {
	try {
		const decrypted = decryptAes(payload.toString());
		return JSON.parse(decrypted) as IData;
	} catch (err) {
		return null;
	}
}
