import express from "express";
import bodyParser from "body-parser";
import path from 'path';
import { WebSocketServer as Server } from 'ws';
import { init } from './server/db_connection.js';
import { setup } from "./server/game_server.js";

const __dirname = path.resolve();
const app = express();
const server = app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
});

init().catch(err => console.log);

// server css as static
app.use(express.static(__dirname));

// get our app to use body parser 
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const ws_server = new Server({ server });
init();
setup(ws_server);
