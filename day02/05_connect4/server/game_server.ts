import { WebSocketServer } from 'ws'
import * as http from 'http'

import { UserActionMessage, GameSessionMessage, ExtendedWebSocket, isGameSessionMessage, isUserActionMessage } from "../models/types.js"
import { Game } from './game.js'
import { generateBoard } from './util.js'
import { MessageHandler } from './message_handler.js'

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
    }

    static handleUserAction(ws: WebSocket, message : UserActionMessage) {
        console.log("handle user action for ", message)

        const game = this.getGameSession(message)

        const userNotification : UserActionMessage = game.updateGameBoard(message)

        if (userNotification) {
            MessageHandler.sendBoardUpdateMessages(this.connections, game, userNotification)
        }
    }
}

function getMessageListener(ws: ExtendedWebSocket) {
    return (event: MessageEvent<any>) => {
        const message : UserActionMessage | GameSessionMessage = JSON.parse(event.data)
        if (isGameSessionMessage(message)) {
            GameServer.handleGameSession(ws, message)
        } else if (isUserActionMessage(message)) {
            GameServer.handleUserAction(ws, message)
        }
    }
}

export function connection_listener(ws: ExtendedWebSocket, req: http.IncomingMessage) {
    const connectionid = req.headers['sec-websocket-key']
    ws.connectionid = connectionid
    GameServer.connections.set(connectionid, ws)
    ws.addEventListener('message', getMessageListener(ws))
}

GameServer.connections = new Map()
GameServer.games = new Map<string, Game>
