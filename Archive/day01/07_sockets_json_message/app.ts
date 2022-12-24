import express from "express";
import bodyParser from "body-parser";
import path from 'path';
import { WebSocketServer as Server } from 'ws';

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

app.post("/", (req, res) => {
    var subName = req.body.yourname
    var subEmail = req.body.youremail;
    res.send("Hello " + subName + ", Thank you for subcribing. You email is " + subEmail);
});

const ws_server = new Server({ server });
const connections = new Set<WebSocket>();

ws_server.on('connection', (ws: WebSocket) => {
    console.log('New client connected!');
    connections.add(ws)

    ws.addEventListener('message', (event: MessageEvent<any>) => {
        const message : string = JSON.parse(event.data);
        connections.forEach((client) => {
            client.send(JSON.stringify(message));
        });
    });

    ws.addEventListener('close', (ev: CloseEvent) => {
        connections.delete(ws);
        console.log('Client has disconnected!');
    });
});

setInterval(() => {
    ws_server.clients.forEach((client) => {
      const data = JSON.stringify({'type': 'time', 'message': new Date().toTimeString()});
      client.send(data);
    });
}, 1000);

setInterval(() => {
    ws_server.clients.forEach((client) => {
      const messages = ['Hello', 'What do you ponder?', 'Thank you for your time', 'Be Mindful', 'Thank You'];
      const random = Math.floor(Math.random() * messages.length);
      let position = {x: Math.floor(Math.random() * 200), y: Math.floor(Math.random() * 150)}
      const data = JSON.stringify({'type': 'message', 'message': messages[random], 'position': position});
      client.send(data);
    });
}, 8000);
