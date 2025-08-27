import express from "express"
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"; //! instead of config, use env
import { middleware } from "./middleware";
import bcrypt from "bcrypt"
import {prismaClient} from "@repo/db/client"
import {CreateRoomSchema, CreateUserSchema, SigninSchema} from "@repo/common/types"
import cors from "cors";

const app = express()
app.use(express.json());
app.use(cors())
//! Add rate limiting and complete the other todos. Also add access control. Right now any user can join any room and stuff. Right now we are able to query any room based on the room id which is not good. Also all of the ws code is in one file, make it singleton, cleaner to read
app.post("/signup", async (req, res) => {
    //! Add zod validations here
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ error: "Invalid data" });
    }
    const { username, password, name } = parsedData.data;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        let user_with_email = await prismaClient.user.findUnique({
            where: {
                email: username
            }
        }) 

        if (user_with_email) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const user = await prismaClient.user.create({
            data: {
                email: username,
                password: hashedPassword,
                name: name,
            }
        })
        res.json({ message: "Signup successful", userId: user.id });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/signin", async (req ,res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ error: "Invalid data" });
    }
    const {username, password} = parsedData.data;
    try {
        const user = await prismaClient.user.findUnique({
            where: {
                email: username,
            }
        });
    
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const match_password = await bcrypt.compare(password, user.password);
        if (!match_password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ error: "Invalid data" });
    }

    // @ts-ignore //! Todo fix this
    const userId = req.userId;
    const {name} = parsedData.data;
    try{
        const room_exist = await prismaClient.room.findUnique({
            where: {
                slug: name
            }
        })

        if (room_exist) {
            return res.status(400).json({ error: "Room name already in use" });
        }
    
        const room = await prismaClient.room.create({
            data: {
                slug: name,
                adminId: userId
            }
        });
        res.json({ message: "Room created successfully", roomId: room.id });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
})

app.get("/chats/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);
    try {
        const chats = await prismaClient.chat.findMany({
            where: {
                roomId
            },
            orderBy: {
                id: 'desc'
            },
            take: 50,
        })
    
        return res.json({chats})
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}) 

app.get("/room/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
        const room = await prismaClient.room.findUnique({
            where: {
                slug
            }
        });

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        return res.json({ room });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
})

app.listen(3001)