import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { User } from "@prisma/client";
const JWT_SECRET = process.env.JWT_SECRET;
interface verifyInterface {
	success: boolean;
	err?: string;
	decoded?: { _id: string; iat: number; exp: number };
}
export const signAccessToken = (
	_id: string,
	options: object = { expiresIn: "30d" }
) => {
	try {
		return jwt.sign({ _id }, JWT_SECRET, options);
	} catch (err) {
		console.log("JWT error while singing access token", err);
	}
};
export const verifyToken = (token: string): verifyInterface => {
	try {
		let result: verifyInterface;
		jwt.verify(
			token,
			JWT_SECRET,
			(err, decoded: { _id: string; iat: number; exp: number }) => {
				if (err)
					return (result = {
						...result,
						success: false,
						err: err.message,
					});
				return (result = { ...result, success: true, decoded });
			}
		);
		return result;
	} catch (err) {
		if (err) {
			console.log(err);
			return { success: true, err: err };
		}
	}
};
export const getUserFromToken = async (
	token: string | "_",
	_id?: string,
	populateArticles?: boolean
): Promise<null | User> => {
	const userId = token === "_" ? _id : verifyToken(token).decoded._id;
	if (!userId) return null;
	const user = await prisma.user.findFirst({ where: { id: userId } });
	return user ? {
		...user,
		password: undefined,
	} : null;
};
