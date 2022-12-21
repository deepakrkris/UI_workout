import express from "express";
import bodyParser from "body-parser";
import path from 'path';
import { WebSocketServer as Server } from 'ws';
import * as http from 'http'

const __dirname = path.resolve();
const app = express();
const server = app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
});

// server css as static
app.use(express.static(__dirname));

// get our app to use body parser 
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

interface ClientSession {
    client : WebSocket,
    coin : string,
};

interface GameMessage {
    coin : string,
    position : number,
};

const ws_server = new Server({ server });
const connections = new Map<String, ClientSession>();
const coins = ['O', 'X'];
const coin_data = ['', '', '', '', '', '', '', '', ''];

ws_server.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    
    let connectionid = req.headers['sec-websocket-key'];
    connections.set(connectionid, {
        client : ws,
        coin : coins.pop(),
    });

    const data = JSON.stringify({'type': 'session',
    'coin' : connections.get(connectionid).coin,
    'grid' : coin_data });
    connections.get(connectionid).client.send(data);

    ws.addEventListener('message', (event: MessageEvent<any>) => {
        const message : GameMessage = JSON.parse(event.data);
        console.log("message from ", connectionid, message.coin, message.position);
        coin_data[message.position] = message.coin;
        connections.forEach((session, id) => {
            if (id != connectionid)
                session.client.send(JSON.stringify(message));
        });
    });

    ws.addEventListener('close', (ev: CloseEvent) => {
        coins.push(connections.get(connectionid).coin);
        connections.delete(connectionid);
        console.log('Client has disconnected!');
    });
});
