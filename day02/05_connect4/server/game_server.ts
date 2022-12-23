import { GameState, UserActionMessage } from "../models/types"
import { WebSocketServer } from 'ws'
import * as http from 'http'

export class GameServer {
    static games: Map<string, GameState>
    static socketServer: WebSocketServer 
    static connections: Map<string, WebSocket>
}

GameServer.connections = new Map()

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

export function connection_listener(ws: WebSocket, req: http.IncomingMessage) {
    const connectionid = req.headers['sec-websocket-key']

    GameServer.connections.set(connectionid, ws)

    ws.addEventListener('message', (event: MessageEvent<any>) => {
        const message : UserActionMessage = JSON.parse(event.data)
 
        console.log('user action message', message.gameCode, message.position)

        if (!GameServer.games.has(message.gameCode)) {
            const game : GameState = {
                gameCode: message.gameCode,
                status: 'registered',
                board: generateBoard()
            }
            GameServer.games.set(game.gameCode, game);
        }

        const game : GameState = GameServer.games.get(message.gameCode);
        game.board[message.position][0] = 'R'

        console.log( game.board)

        GameServer.connections.forEach((client) => {
            client.send(JSON.stringify(message))
        })
    })
}
