import { WebSocketServer } from 'ws'
import * as http from 'http'

import { UserActionMessage, GameSessionMessage, NotificationMessage, ExtendedWebSocket, isGameSessionMessage, isUserActionMessage } from "../models/types.js"
import { Game } from './game.js'
import { generateBoard } from './util.js'

export class GameServer {
    static games: Map<string, Game>
    static socketServer: WebSocketServer 
    static connections: Map<string, WebSocket>

    static getGameSession(message : GameSessionMessage | UserActionMessage) {
        if (!GameServer.games.has(message.gameCode)) {
            const game = new Game({
                gameCode: message.gameCode,
                status: 'registered',
                board: generateBoard()
            })
            GameServer.games.set(message.gameCode, game);
        }

        return GameServer.games.get(message.gameCode)
    }

    static handleGameSession(ws: ExtendedWebSocket, message : GameSessionMessage) {
        const game = this.getGameSession(message)
        const notification : GameSessionMessage = game.initGame(ws, message);
        ws.send(JSON.stringify(notification))
        console.log(game)
    }

    static handleUserAction(ws: WebSocket, message : UserActionMessage) {
        console.log("handle user action for ", message.userId, message.row, message.side)
        const game = this.getGameSession(message)

        const userNotification = game.updateGameBoard(message);
        if (userNotification) {
            GameServer.connections.forEach((client) => {
                client.send(JSON.stringify(userNotification))
            })
        }

        const start_your_turn : NotificationMessage = {
            'type': 'take_turn',
            message: 'Your turn now !'
        }
        const next_user_connectionId : string = game.handleNextUserTurn(ws, message.userId)
        GameServer.connections.get(next_user_connectionId).send(JSON.stringify(start_your_turn));
    }
}

GameServer.connections = new Map()
GameServer.games = new Map<string, Game>

export function connection_listener(ws: ExtendedWebSocket, req: http.IncomingMessage) {
    const connectionid = req.headers['sec-websocket-key']
    ws.connectionid = connectionid

    GameServer.connections.set(connectionid, ws)

    ws.addEventListener('message', (event: MessageEvent<any>) => {
        const message : UserActionMessage | GameSessionMessage = JSON.parse(event.data)
        if (isGameSessionMessage(message)) {
            GameServer.handleGameSession(ws, message)
        } else if (isUserActionMessage(message)) {
            GameServer.handleUserAction(ws, message)
        }
    })
}
