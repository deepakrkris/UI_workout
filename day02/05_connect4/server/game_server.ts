import { GameState, UserActionMessage, GameSessionMessage, isGameSessionMessage, isUserActionMessage } from "../models/types.js"
import { WebSocketServer } from 'ws'
import * as http from 'http'

const valid_gamecodes = new Set(['grumpy', 'sleepy', 'sneezy', 'happy', 'dopey'])
const user1_coin = 'RED_COIN'
const user2_coin = 'BLUE_COIN'

export class GameServer {
    static games: Map<string, GameState>
    static socketServer: WebSocketServer 
    static connections: Map<string, WebSocket>

    static handleGameSession(ws: WebSocket, game : GameState, message : GameSessionMessage) {
        const notification : GameSessionMessage = {
            gameCode: message.gameCode,
            userId: message.userId
        }

        if (!game.user1) {
            game.user1 = message.userId
            game.status = 'waiting_for_user2'
            notification.coin = user1_coin
            ws.send(JSON.stringify(notification))
        } else if (!game.user2) {
            game.user2 = message.userId
            game.status = 'start'
            notification.coin = user2_coin
            ws.send(JSON.stringify(notification))
        }
    }

    static handleUserAction(ws: WebSocket, game : GameState, message : UserActionMessage) {
        const column_available = lastAvailableColumn(game.board[message.row])
        if (column_available > -1) {
            game.board[message.row][column_available] = 'R'
            const notification : UserActionMessage = {
                gameCode: message.gameCode,
                row: message.row,
                col: column_available,
                coin: message.coin,
            }
            GameServer.connections.forEach((client) => {
                client.send(JSON.stringify(notification))
            })
        }
    }
}

GameServer.connections = new Map()
GameServer.games = new Map<string, GameState>

function generateBoard() {
    const board : string[][] = []
    for (let row=0; row<7; ++row) {
        const row = []
        for (let col=0; col<7; ++col) {
            row.push('')
        }
        board.push(row)
    }
    return board
}

function lastAvailableColumn(row : string[]) {
    for (let i=0; i<7; ++i) {
        if (row[i] == '')
           return i
    }
    return -1
}

export function connection_listener(ws: WebSocket, req: http.IncomingMessage) {
    const connectionid = req.headers['sec-websocket-key']

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
