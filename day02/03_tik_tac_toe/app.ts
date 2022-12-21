import express from "express";
import bodyParser from "body-parser";
import path from 'path';
import { WebSocketServer as Server } from 'ws';
import * as http from 'http'
import { ClientSession , GameMessage, NotificationMessage } from './game_types';
import e from "express";

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

const ws_server = new Server({ server });
const connections = new Map<String, ClientSession>();
const coins = ['O', 'X'];
const coin_data = ['', '', '', '', '', '', '', '', ''];

function sameColumnMatch(last_move : number, coin: string) {
    const column = last_move % 3;
    const match_candidate = [
        coin_data[column + 0],
        coin_data[column + 3],
        coin_data[column + 6],
    ];
    return match_candidate.every((value) => value === coin);
}

function sameRowMatch(last_move : number, coin: string) {
    const row_offset = Math.floor(last_move/3) * 3;
    const match_candidate = [
        coin_data[row_offset + 0],
        coin_data[row_offset + 1],
        coin_data[row_offset + 2],
    ];
    return match_candidate.every((value) => value === coin);
}

function diagonalMatch(last_move : number, coin: string) {
    const diagonals = [[0, 4, 8], [2, 4, 6]];
    if (last_move == 0 || last_move == 2 || last_move == 6 || last_move == 8) {
        const result = diagonals.filter((indexes) => {
            return indexes.every((i) => coin_data[i] === coin);
        });
        return result.length ? true : false;
    }
    return false;
}

function isWinningMove(last_move : number, coin: string) : boolean {
    if (sameRowMatch(last_move, coin) || sameColumnMatch(last_move, coin) || diagonalMatch(last_move, coin)) {
        return true;
    }
    return false;
}

ws_server.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    const connectionid = req.headers['sec-websocket-key'];

    connections.set(connectionid, {
        client : ws,
        coin : coins.pop(),
    });

    const data = JSON.stringify({
        'type': 'session',
        'coin' : connections.get(connectionid).coin,
        'grid' : coin_data 
    });

    connections.get(connectionid).client.send(data);

    ws.addEventListener('message', (event: MessageEvent<any>) => {
        const message : GameMessage = JSON.parse(event.data);
        coin_data[message.position] = message.coin;

        connections.forEach((session, id) => {
            if (id != connectionid)
                session.client.send(JSON.stringify(message));
        });

        if (isWinningMove(message.position, message.coin)) {
            const message = "You Won !!!";
            connections.forEach((session, id) => {
                if (id == connectionid) {
                    const result_data : NotificationMessage = {
                        'type': 'result',
                        message,
                    };
                    session.client.send(JSON.stringify(result_data));
                } else {
                    const result_data : NotificationMessage = {
                        'type': 'result',
                        message: 'The other player won :) , Ask for a re-match !! '
                    };
                    session.client.send(JSON.stringify(result_data));
                }
            });
        }
    });

    ws.addEventListener('close', (ev: CloseEvent) => {
        coins.push(connections.get(connectionid).coin);
        connections.delete(connectionid);
        console.log('Client has disconnected!');
    });
});
