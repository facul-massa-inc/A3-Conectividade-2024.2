import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 3000 });

server.on("connection", (ws) => {
    
    ws.on("message", (data) => {
        server.clients.forEach(client => client.send(data.toString("utf-8")));
    });
});