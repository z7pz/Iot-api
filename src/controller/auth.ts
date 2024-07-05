import { Request, Response } from "express";
import { signAccessToken, verifyToken } from "../helpers/jwt";
import { hash, compare } from "../helpers/bcrypt";
import { loginSchema, registerSchema } from "../validation/auth";
import { convertToMs } from "../helpers/date";
import { prisma } from "../prisma";
export interface ILoginBody {
	email: string;
	password: string;
}
export interface IRegisterBody extends ILoginBody {
	name: string;
	username: string;
	gender: "male | female";
	birthdate: string;
}

const loginWithToken = async (req: Request, res: Response) => {
	if (!req.headers.authorization)
		return res.status(400).send("Unauthorized.");
	let token = req.headers.authorization;
    let data = verifyToken(token)
};
const register = async (req: Request, res: Response) => {
	try {
		const body: IRegisterBody = req.body;
		await registerSchema.validateAsync(body);
		const doesUserExists = await prisma.user.findFirst({
			where: { email: body.email },
		});
		if (doesUserExists) {
			return res.status(403).send({
				message: "A user with this email already exists",
				success: false,
			});
		}
		const hashedPassword = await hash(body.password);
		const newUser = await prisma.user.create({
			data: {
				username: body.username,
				email: body.email,
				password: hashedPassword,
			},
		});
		const accessToken = signAccessToken(newUser.id);
		const MONTH_IN_MS = convertToMs("1-month");
		res.cookie("access_token", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production" ? true : false,
			maxAge: MONTH_IN_MS,
		});
		return res
			.status(200)
			.send({ success: true, message: "تم انشاء الحساب" });
	} catch (err) {
		console.log(err);
		switch (true) {
			case err.isJoi:
				const { message, context } = err.details[0];
				return res.status(401).send({ success: false, message });
			case err.code === 11000 && err.keyPattern.email === 1:
				return res
					.status(403)
					.send({ success: false, usedEmail: true });
			case err.code === 11000 && err.keyPattern.username === 1:
				return res
					.status(403)
					.send({ success: false, usedUsername: true });
			default:
				res.status(500).send({
					success: false,
					message: "Internal Server error",
				});
		}
	}
};

const login = async (req: Request, res: Response) => {
	try {
		const body: ILoginBody = req.body;
		await loginSchema.validateAsync(body);
		const user = await prisma.user.findFirst({
			where: { email: body.email },
		});
		if (!user)
			return res.status(401).send({
				success: false,
				message: "الايميل و الباسوورد لا يتطباقان",
			});

		const comparePasswords = await compare(body.password, user.password);
		if (!comparePasswords)
			return res.status(401).send({
				success: false,
				message: "الايميل و الباسوورد لا يتطباقان",
			});
		const MONTH_IN_MS = convertToMs("1-month");
		const accessToken = signAccessToken(String(user.id));
		res.cookie("access_token", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production" ? true : false,
			maxAge: MONTH_IN_MS,
		});
		res.status(201).send({ success: true, accessToken });
	} catch (err) {
		console.log(err);
		if (err.isJoi) {
			const { message, context } = err.details[0];
			res.status(401).send({ success: false, message, context });
		} else {
			res.status(500).send({
				success: false,
				message: "Interal server error",
			});
		}
	}
};
const logout = async (req: Request, res: Response) => {
	try {
		res.cookie("access_token", "")
			.status(200)
			.send({ success: true, message: "تم تسجيل الخروج بنجاح" });
	} catch (err) {
		console.log(err);
	}
};

export { register, login, logout };
