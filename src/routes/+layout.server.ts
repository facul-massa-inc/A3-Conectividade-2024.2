import { WebSocketServer, type AddressInfo } from 'ws';
import crypto from "crypto";
import type { MessageData } from '../lib/lib';
import { palavrasFeias } from '$lib/server/palavrasfeias';

const server = new WebSocketServer({ port: 1000 });
const palavrasFeiasRegex = new RegExp(`\\b(?:${palavrasFeias.join("|")})\\b`, "gi");
const salt = crypto.randomBytes(32);

server.on("connection", (ws, req) => {
    
    ws.on("message", (data) => { 
        let parsedData: MessageData;
        try { parsedData = JSON.parse(data.toString()) } catch(e) { return; };
        parsedData.identifier = crypto.hash("sha256", Buffer.concat(
            [Buffer.from(<string>req.socket.remoteAddress), salt]), "base64"
        );
        if(parsedData.message) {
            parsedData.message = parsedData.message.replace(palavrasFeiasRegex, s=>"*".repeat(s.length));
        }
        server.clients.forEach(client => client.send(JSON.stringify(parsedData)));
    });
});

