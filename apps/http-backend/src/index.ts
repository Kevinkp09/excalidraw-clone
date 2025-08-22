import express from "express"
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config"; //! instead of config, use env
import { middleware } from "./middleware";
const app = express()

app.post("/signup", (req, res) => {
    //! Add zod validations here
    res.json({ message: "Signup successful" });
});

app.post("/signin", (req ,res) => {
    const userId = 1;
    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({ token });
})

app.post("/room", middleware, (req, res) => {
    res.json({ message: "Room created successfully" });
})

app.listen(3001)