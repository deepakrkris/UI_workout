import { GameState, UserActionMessage } from "../models/types"
import { WebSocketServer } from 'ws'
import * as http from 'http'

export class GameServer {
    static games: Map<string, GameState>
    static socketServer: WebSocketServer 
    static connections: Map<string, WebSocket>
}

GameServer.connections = new Map()

export function connection_listener(ws: WebSocket, req: http.IncomingMessage) {
    const connectionid = req.headers['sec-websocket-key']

    GameServer.connections.set(connectionid, ws)

    ws.addEventListener('message', (event: MessageEvent<any>) => {
        const message : UserActionMessage = JSON.parse(event.data)
 
        console.log('user action message', message.position)

        GameServer.connections.forEach((client) => {
            client.send(JSON.stringify(message))
        })
    })
}
