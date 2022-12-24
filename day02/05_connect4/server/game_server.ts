import { WebSocketServer } from 'ws'
import * as http from 'http'

import { UserActionMessage,
    GameSessionMessage,
    ExtendedWebSocket,
    isGameSessionMessage,
    isUserActionMessage } from "../models/types.js"
import { Game } from './game.js'
import { generateBoard } from './util.js'

export class GameServer {
    static games: Map<string, Game>
    static socketServer: WebSocketServer 
    static connections: Map<string, WebSocket>
    static connection_to_game: Map<string, string>

    static createNewGame(message : GameSessionMessage | UserActionMessage) {
        const game = new Game({
            gameCode: message.gameCode,
            status: 'registered',
            board: generateBoard()
        })
        return game
    }

    static getGameSession(message : GameSessionMessage | UserActionMessage) {
        if (!GameServer.games.has(message.gameCode)) {
            const game = this.createNewGame(message)
            GameServer.games.set(message.gameCode, game);
        }
        return GameServer.games.get(message.gameCode)
    }

    static establishUserGameSession(ws: ExtendedWebSocket, message : GameSessionMessage) {
        const game = this.getGameSession(message)
        game.initGame(ws, message)
    }

    static executeUserTurns(ws: WebSocket, message : UserActionMessage) {
        const game = this.getGameSession(message)
        game.executeUserTurns(message)
    }

    static getMessageListener(ws: ExtendedWebSocket) {
        return (event: MessageEvent<any>) => {
            const message : UserActionMessage | GameSessionMessage = JSON.parse(event.data)
            if (isGameSessionMessage(message)) {
                this.establishUserGameSession(ws, message)
            } else if (isUserActionMessage(message)) {
                this.executeUserTurns(ws, message)
            }
        }
    }
}

export function connection_listener(ws: ExtendedWebSocket, req: http.IncomingMessage) {
    const connectionid = req.headers['sec-websocket-key']
    ws.connectionid = connectionid
    GameServer.connections.set(connectionid, ws)
    ws.addEventListener('message', GameServer.getMessageListener(ws))
    ws.addEventListener('close', (ev: CloseEvent) => {
        const gameCode : string = GameServer.connection_to_game.get(ws.connectionid)
        const game = GameServer.games.get(gameCode)
        game.handleDisconnectedUser(ws.connectionid)
        GameServer.connections.delete(connectionid);
        console.log('Client has disconnected!');
    });
}

GameServer.connections = new Map<string, WebSocket>()
GameServer.games = new Map<string, Game>
GameServer.connection_to_game = new Map<string, string>