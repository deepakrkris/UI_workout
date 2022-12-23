import { WebSocketServer } from 'ws'
import * as http from 'http'

import { GameState, UserActionMessage, GameSessionMessage, isGameSessionMessage, isUserActionMessage, NotificationMessage, ExtendedWebSocket } from "../models/types.js"
import { lastAvailableColumn , generateBoard } from './util.js'

const valid_gamecodes = new Set(['grumpy', 'sleepy', 'sneezy', 'happy', 'dopey'])
const user1_coin = 'RED_COIN'
const user2_coin = 'BLUE_COIN'

export class GameServer {
    static games: Map<string, GameState>
    static socketServer: WebSocketServer 
    static connections: Map<string, WebSocket>

    static handleGameSession(ws: ExtendedWebSocket, game : GameState, message : GameSessionMessage) {
        const notification : GameSessionMessage = {
            gameCode: message.gameCode,
            userId: message.userId,
            type : 'session',
        }

        if (!game.user1) {
            game.user1 = message.userId
            game.user1_connection = ws.connectionid
            game.status = 'waiting_for_user2'
            notification.coin = user1_coin
            ws.send(JSON.stringify(notification))
        } else if (!game.user2) {
            game.user2 = message.userId
            game.user2_connection = ws.connectionid
            game.status = 'start'
            notification.coin = user2_coin
            ws.send(JSON.stringify(notification))
        }
        console.log(game)
    }

    static handleUserAction(ws: WebSocket, game : GameState, message : UserActionMessage) {
        console.log("handle user action for ", message.userId, message.row, message.side)

        const column_available = lastAvailableColumn(game.board[message.row], message.side)
        if (column_available > -1) {
            game.board[message.row][column_available] = message.coin
            const notification : UserActionMessage = {
                gameCode: message.gameCode,
                row: message.row,
                col: column_available,
                coin: message.coin,
                side: message.side,
                userId: message.userId,
            }
            GameServer.connections.forEach((client) => {
                client.send(JSON.stringify(notification))
            })
            this.handleNextUserTurn(ws, game, message.userId)
        }
    }
    
    static handleNextUserTurn(ws: WebSocket, game : GameState, current_user_id : string) {
        const start_your_turn : NotificationMessage = {
            'type': 'take_turn',
            message: 'Your turn now !'
        }

        let next_user_connectionId = null;
        if (current_user_id == game.user1) {
            console.log("user 2 now")
            next_user_connectionId = game.user2_connection
        } else {
            console.log("user 1 now")
            next_user_connectionId = game.user1_connection
        }

        GameServer.connections.get(next_user_connectionId).send(JSON.stringify(start_your_turn));
    }
}

GameServer.connections = new Map()
GameServer.games = new Map<string, GameState>

export function connection_listener(ws: ExtendedWebSocket, req: http.IncomingMessage) {
    const connectionid = req.headers['sec-websocket-key']
    ws.connectionid = connectionid

    GameServer.connections.set(connectionid, ws)

    ws.addEventListener('message', (event: MessageEvent<any>) => {
        const message : UserActionMessage | GameSessionMessage = JSON.parse(event.data)
         
        if (!GameServer.games.has(message.gameCode)) {
            const game : GameState = {
                gameCode: message.gameCode,
                status: 'registered',
                board: generateBoard()
            }
            GameServer.games.set(game.gameCode, game);
        }

        const game : GameState = GameServer.games.get(message.gameCode)

        if (isGameSessionMessage(message)) {
            GameServer.handleGameSession(ws, game, message)
        } else if (isUserActionMessage(message)) {
            GameServer.handleUserAction(ws, game, message)
        }
    })
}
