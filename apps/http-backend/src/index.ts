import express from "express"
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"; //! instead of config, use env
import { middleware } from "./middleware";
import {CreateRoomSchema, CreateUserSchema, SigninSchema} from "@repo/common/types"
const app = express()

app.post("/signup", (req, res) => {
    //! Add zod validations here
    const data = CreateUserSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({ error: "Invalid data" });
    }
    res.json({ message: "Signup successful" });
});

app.post("/signin", (req ,res) => {
    const data = SigninSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({ error: "Invalid data" });
    }
    const userId = 1;
    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({ token });
})

app.post("/room", middleware, (req, res) => {
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({ error: "Invalid data" });
    }
    res.json({ message: "Room created successfully" });
})

app.listen(3001)