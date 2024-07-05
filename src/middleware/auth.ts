import { Request, Response, NextFunction } from "express";
import { getUserFromToken, verifyToken } from "../helpers/jwt";
const isLoggedIn = (isAuthRequired: boolean | "_", setStatusOnly: boolean = false) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToken = req.cookies.access_token;
            const decodedToken = verifyToken(accessToken);
            const user =
                !decodedToken.success
                    ? null
                    : await getUserFromToken("_", decodedToken.decoded._id);

            if (setStatusOnly) {
                req.user = user;
                return next();
            }
            if (!user && isAuthRequired) {
                return res
                    .status(401)
                    .send({ success: false, isLoggedIn: false, message: "لم يتم العثور على المستخدم" });
            }
            if (user && !isAuthRequired) {
                return res
                    .status(403)
                    .send({ success: false, isLoggedIn: true, message: "تم تسجيل الدخول مسبقا" });
            }
            if (user && isAuthRequired) {
                req.user = user;
                return next();
            }
            if (!user && !isAuthRequired) {
                return next();
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({ success: false, isLoggedIn: false, message: "Internal server error" });
        }
    };
};
export {
    isLoggedIn,
};
