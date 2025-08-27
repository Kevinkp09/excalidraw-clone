"use client"
import { useEffect, useState } from "react";
import { WS_BACKEND } from "@/config";
import { Canvas } from "./Canvas";
export function RoomCanvas({roomId}: {roomId: string}  ) {
    const [socket, setSocket] = useState<WebSocket | null>(null); //! ideally we should create a hook and use that like useSocket

    useEffect(() => {
        const ws = new WebSocket(`${WS_BACKEND}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNDM3YzEwOS0zNTM1LTQ4MWUtYmRmMi00ZDljYmI4ODM4ODQiLCJpYXQiOjE3NTYyNzM2MzJ9.gd_VwMbFwIWXxaBw_4SE7uxfY__resLCNqFlkkeuEBA`)
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({type: "join_room", roomId}));
        }
    }, []);

    if (!socket) {
        return <div>Connecting to Server...</div>
    }
    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>;
}
