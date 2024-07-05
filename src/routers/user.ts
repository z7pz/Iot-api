import { Router } from "express";
import { getUser } from "../controller/user";

const userRouter = Router();

userRouter.get('/', getUser)


export { userRouter };
