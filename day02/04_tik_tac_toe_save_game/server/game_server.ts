import { WebSocketServer as Server } from 'ws';
import * as http from 'http'
import { ClientState , GameMessage, NotificationMessage, GameState, isSessionObject, isGameMessage, SessionMessage } from '../models/game_types.js';
import { isWinningMove } from './board_handlers.js';
import { createOrGetGameSession, saveGameMove, saveGameResult } from './repository.js';

interface ExtendedWebSocket extends WebSocket {
    connectionid : string,
};

class GameServer {
    static ws_server: Server;
    static connections: Map<string, ClientState>;
    static games: Map<string, GameState>;
}

async function establishSession(game : GameState, status : string, connectionid : string) {
    const saved_game : GameState = GameServer.games.get(game.id);
    saved_game.connections = saved_game.connections || [];
    saved_game.connections.push(connectionid);

    GameServer.connections.get(connectionid).client.send(JSON.stringify({
        'type': 'session_created',
        'coin' : status == 'new' ? saved_game.user1_coin : saved_game.user2_coin,
        'grid' : saved_game.coin_data,
        'gameId': saved_game.id,
    }));
}

async function handleGameEnd(client_message : GameMessage, game : GameState, current_user_connection_id : string) {
    if (isWinningMove(game, client_message.position, client_message.coin)) {
        const message = "You Won !!!"; 

        await saveGameResult(client_message);

        GameServer.connections.forEach((session, id) => {
            if (id == current_user_connection_id) {
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
}

async function publishGameMoves(message : GameMessage, game : GameState, current_user_connection_id : string) {
    game.connections.forEach((id) => {
        if (id != current_user_connection_id) {
            const client = GameServer.connections.get(id).client;
            client.send(JSON.stringify(message));
            client.send(JSON.stringify({
                'type': 'take_turn',
                message: 'Your turn now !'
            }));
        }
    });
}

export async function messageHandler (data : SessionMessage | GameMessage | NotificationMessage, connectionid : string) {
    if (isSessionObject(data)) {
        const game : GameState = await createOrGetGameSession(data);
        if (!GameServer.games.get(game.id)) {
            if (game.status == "new") {
                game.coin_data = [];
                game.connections = [];
                GameServer.games.set(game.id, game);
            }
        }
        await establishSession(GameServer.games.get(game.id), game.status, connectionid);
    } else if (isGameMessage(data)) {
        const game : GameState = GameServer.games.get(data.gameId);
        game.coin_data[data.position] = data.coin;
        await saveGameMove(data, game);
        await publishGameMoves(data, game, connectionid);
        await handleGameEnd(data, game, connectionid);
    }
}

function server_message_handler (event: MessageEvent<any>) {
    const message : GameMessage | SessionMessage | NotificationMessage = JSON.parse(event.data);
    const connectionid = this.connectionid;
    messageHandler(message, connectionid);
}

function new_connection_handler(ws: ExtendedWebSocket, req: http.IncomingMessage) {
    const connectionid = req.headers['sec-websocket-key'];
 
    ws.connectionid = connectionid;

    GameServer.connections.set(connectionid, {
        client : ws,
    });
    GameServer.connections.get(connectionid).client.send(JSON.stringify({
        'type': 'connection_created',
        connectionid,
    }));

    ws.addEventListener('message', server_message_handler.bind(ws));
    ws.addEventListener('close', (ev: CloseEvent) => {
        GameServer.connections.delete(connectionid);
        console.log('Client has disconnected!');
    });
}

export function setup (ws_server: Server) {
    GameServer.ws_server = ws_server;
    GameServer.connections = new Map<string, ClientState>();
    GameServer.games = new Map<string, GameState>();
    GameServer.ws_server.on('connection', new_connection_handler);
}
