import { HTTP_BACKEND } from "@/config"
import axios from "axios"

type Shape = {
    type: "rect"
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "circle"
    centerX: number,
    centerY: number,
    radius: number
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const existingShapes: Shape[] = await getExistingShapes(roomId); //! Here also we should properly do state management for existing shapes and not store them in a variable
    console.log("Existing shapes: ", existingShapes);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "chat") {
            const parsedMessage = JSON.parse(message.message);
            existingShapes.push(parsedMessage);
            clearCanvas(existingShapes, ctx, canvas);
        }
    }
    clearCanvas(existingShapes, ctx, canvas);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let startX = 0;
    let startY = 0;
    let clicked = false;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    })

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        const shape: Shape = {
            type: "rect",
            x: startX,
            y: startY,
            width,
            height
        }
        existingShapes.push(shape)

        socket.send(JSON.stringify({type: "chat", roomId, message: JSON.stringify(shape)}));
    })

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(existingShapes, ctx, canvas);
            ctx.strokeStyle = "white";
            ctx.strokeRect(startX, startY, width, height);
        }
    })
}

function clearCanvas(existingShapes: Shape[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    existingShapes.map(shape => {
        if (shape.type === "rect") {
            ctx.strokeStyle = "white";
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    })
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.chats;
    
    const shapes = messages.map((m: {message: string}) => {
        const messageData = JSON.parse(m.message);
        return messageData;
    })

    return shapes;
}