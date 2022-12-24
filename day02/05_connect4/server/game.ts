import { lastAvailableColumn , generateBoard } from './util.js'
import { ExtendedWebSocket, GameSessionMessage, GameState, UserActionMessage, NotificationMessage } from "../models/types.js"

const valid_gamecodes = new Set(['grumpy', 'sleepy', 'sneezy', 'happy', 'dopey'])
const user1_coin = 'RED_COIN'
const user2_coin = 'BLUE_COIN'

export class Game {
    game_state : GameState

    constructor(game_state : GameState) {
        this.game_state = game_state
    }

    initGame(ws : ExtendedWebSocket, message : GameSessionMessage) {
        const notification : GameSessionMessage = {
            gameCode: message.gameCode,
            userId: message.userId,
            type : 'session',
        }

        const game_state = this.game_state

        if (!game_state.user1) {
            game_state.user1 = message.userId
            game_state.user1_connection = ws.connectionid
            game_state.status = 'waiting_for_user2'
            notification.coin = user1_coin
            ws.send(JSON.stringify(notification))
        } else if (!game_state.user2) {
            game_state.user2 = message.userId
            game_state.user2_connection = ws.connectionid
            game_state.status = 'start'
            notification.coin = user2_coin
            ws.send(JSON.stringify(notification))
        }
        console.log(this)
        return notification
    }

    updateGameBoard(message: UserActionMessage) {
        const game_state = this.game_state
        const column_available = lastAvailableColumn(game_state.board[message.row], message.side)
        if (column_available > -1) {
            game_state.board[message.row][column_available] = message.coin
            const notification : UserActionMessage = {
                gameCode: message.gameCode,
                row: message.row,
                col: column_available,
                coin: message.coin,
                side: message.side,
                userId: message.userId,
            }
            return notification
        }
    }

    handleNextUserTurn(ws: WebSocket, current_user_id : string) {
        let next_user_connectionId = null;
        if (current_user_id == this.game_state.user1) {
            console.log("user 2 now")
            next_user_connectionId = this.game_state.user2_connection
        } else {
            console.log("user 1 now")
            next_user_connectionId = this.game_state.user1_connection
        }

        return next_user_connectionId;
    }   
}
