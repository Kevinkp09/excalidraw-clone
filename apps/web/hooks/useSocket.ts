import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>()

    useEffect(() => {
        console.log("Attempting to connect to WebSocket:", WS_URL);
        const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MDI3MDNlMi1mZTg2LTQ2ZTYtYTdhMS0xODc1NTY1ZDQyMjMiLCJpYXQiOjE3NTYwNDQyNDJ9.SGqggXMz7_f_Tt_lOK5PZkTtDLq5SPNrG95Asp_GCWI";
        const ws = new WebSocket(`${WS_URL}?token=${testToken}`);
        
        ws.onopen = () => {
            console.log("WebSocket connected successfully");
            console.log("WebSocket readyState:", ws.readyState);
            // Set socket first, then set loading to false
            setSocket(ws);
            // Add a small delay to ensure the socket is fully ready
            setTimeout(() => {
                setLoading(false);
            }, 100);
        }

        ws.onclose = (event) => {
            console.log("WebSocket disconnected", event.code, event.reason);
            setLoading(true);
            setSocket(undefined);
        }

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setLoading(true);
            setSocket(undefined);
        }

        return () => {
            console.log("Cleaning up WebSocket connection");
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, []);

    return {
        socket,
        loading
    }
}