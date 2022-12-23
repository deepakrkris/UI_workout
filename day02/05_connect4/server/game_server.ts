import { GameState, UserActionMessage } from "../models/types"
import { WebSocketServer } from 'ws'
import * as http from 'http'

export class GameServer {
    static games: Map<string, GameState>
    static socketServer: WebSocketServer 
    static connections: Map<string, WebSocket>
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
        const message : UserActionMessage = JSON.parse(event.data)

        if (!GameServer.games.has(message.gameCode)) {
            const game : GameState = {
                gameCode: message.gameCode,
                status: 'registered',
                board: generateBoard()
            }
            GameServer.games.set(game.gameCode, game);
        }

        const game : GameState = GameServer.games.get(message.gameCode)

        const column_available = lastAvailableColumn(game.board[message.row])
        if (column_available > -1) {
            game.board[message.row][column_available] = 'R'
            const notification : UserActionMessage = {
                gameCode: message.gameCode,
                row: message.row,
                col: column_available,
            }
            GameServer.connections.forEach((client) => {
                client.send(JSON.stringify(notification))
            })
        }
    })
}
