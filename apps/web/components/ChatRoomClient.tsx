"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket"

export function ChatRoomClient({
    messages,
    id
}: {
    messages: {message: string}[],
    id: string
}) {
    const {socket, loading} = useSocket();
    const [chats, setChats] = useState(messages);
    const [currentMessage, setCurrentMessage] = useState("");
    useEffect(() => {
        socket?.send(JSON.stringify({type: "join_room", roomId: id}));
        if (socket && !loading) {
        socket.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type === "chat") { //!  parsedData.roomId === Number(id)
                setChats(c => [...c, {message: parsedData.message}])
            }
        }
    }
    }, [socket, loading, id]);

    return <div>{chats?.map((chat, index) => <div key={index}>{chat.message}</div>)}
        <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} />
        <button onClick={() => {
            socket?.send(JSON.stringify({type: "chat", roomId: id, message: currentMessage}));
            setCurrentMessage("");
        }}>Send Message</button>
    </div>
}