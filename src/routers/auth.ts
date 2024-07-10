import { Router } from "express";
import { login, logout, register } from "../controller/auth";
import { isLoggedIn } from "../middleware";

const authRouter = Router();

authRouter.post('/register', isLoggedIn(false), register)

authRouter.post('/login', isLoggedIn(false), login)

authRouter.post("/logout", isLoggedIn(true), logout)

export { authRouter };
