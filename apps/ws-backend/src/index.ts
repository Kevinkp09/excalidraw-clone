import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client"
const wss = new WebSocketServer({port: 8080})

//! This is very ugly way of managing state. You should not do this. Use redux toolkit(best) or singleton approach
interface User {
    userId: string,
    rooms: string[],
    ws: WebSocket
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
    
        if (typeof decoded === 'string') {
            return null;
        }
        if (!decoded || !decoded.userId) {
            return null;
        }
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

wss.on('connection', function connection(ws, request) {
    const url = request.url;
    if (!url) {
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);
    if (!userId) {
        ws.close();
        return;
    }

    users.push({
        userId,
        rooms: [],
        ws
    })
    ws.on('message', async function message(data) {
        const parsedData = JSON.parse(data as unknown as string);
        if (parsedData.type === "join_room") {
            const user = users.find(u => u.ws === ws);
            //! here you should have checks whether the room exist with this id or not. 
            user?.rooms.push(parsedData.roomId);
        }

        if (parsedData.type === "leave_room") {
            const user = users.find(u => u.ws === ws);
            if (!user) {
                return;
            }
            user.rooms = user.rooms.filter(room => room !== parsedData.roomId);
        }

        if (parsedData.type === "chat") {
            //! ideally you shouldnt store in db like this directly. You should use queues and store it in them and through a pipeline store in db.
            await prismaClient.chat.create({
                data: {
                    roomId: parsedData.roomId,
                    userId: userId,
                    message: parsedData.message
                }
            })
            users.forEach(user => {
                if (user.rooms.includes(parsedData.roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        roomId: parsedData.roomId,
                        message: parsedData.message
                    }))
                }
            })
        }
    })
} )