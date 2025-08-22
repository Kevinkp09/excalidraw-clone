import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded) {
        // @ts-ignore //! add global.d.ts file. Google how can you update the structure of request object in express
        req.userId = decoded.userId;
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
}
