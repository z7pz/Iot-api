import { IUser } from "interfaces/global";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(compression())
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

app.listen(process.env.PORT, () => {
    console.log("Server is running on port: " + process.env.PORT);
});

declare module 'express' {
    interface Request {
        user: IUser;
    }
}