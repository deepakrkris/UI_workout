import { lastAvailableColumn } from './util.js'
import { ExtendedWebSocket, GameSessionMessage, GameState, UserActionMessage } from "../models/types.js"
import { sameRowMatch, sameColumnMatch, diagonalMatch } from './board_handlers.js'

const valid_gamecodes = new Set(['grumpy', 'sleepy', 'sneezy', 'happy', 'dopey'])
const user1_coin = 'RED_COIN'
const user2_coin = 'BLUE_COIN'

export class Game {
    game_state : GameState
    last_move_row : number
    last_move_col : number
    last_move_coin : string
    isUser1Turn : boolean
    isUser2Turn : boolean

    constructor(game_state : GameState) {
        this.game_state = game_state
    }

    initUser1(userId : string, connectionId : string) {
        const game_state = this.game_state
        game_state.user1 = userId
        game_state.user1_connection = connectionId
        game_state.status = 'waiting_for_user2'
    }

    initUser2(userId : string, connectionId : string) {
        const game_state = this.game_state
        game_state.user2 = userId
        game_state.user2_connection = connectionId
        game_state.status = 'start'
    }

    getUser1Connection(connections: Map<string, WebSocket>) {
        return connections.get(this.game_state.user1_connection)
    }

    getUser2Connection(connections: Map<string, WebSocket>) {
        return connections.get(this.game_state.user2_connection)
    }

    initGame(ws : ExtendedWebSocket, message : GameSessionMessage) {
        const notification : GameSessionMessage = {
            gameCode: message.gameCode,
            userId: message.userId,
            type : 'session',
        }

        const game_state = this.game_state

        if (!game_state.user1) {
            this.initUser1(message.userId, ws.connectionid)
            notification.coin = user1_coin
        } else if (!game_state.user2) {
            this.initUser2(message.userId, ws.connectionid)
            notification.coin = user2_coin
        }
        return notification
    }

    updateGameBoard(message: UserActionMessage) {
        const game_state = this.game_state
        const column_available = lastAvailableColumn(game_state.board[message.row], message.side)
        if (column_available > -1) {
            game_state.board[message.row][column_available] = message.coin
 
            this.isUser1Turn = message.userId === game_state.user1
            this.isUser2Turn = message.userId === game_state.user2
            this.last_move_row = message.row
            this.last_move_col = column_available
            this.last_move_coin = message.coin

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

    handleNextUserTurn() {
        if (this.isUser1Turn) {
            return this.game_state.user2_connection
        } else {
            return this.game_state.user1_connection
        }
    }

    isWinningMove() : boolean {
        if (sameRowMatch(this.game_state, this.last_move_row, this.last_move_col, this.last_move_coin)
            || sameColumnMatch(this.game_state, this.last_move_row, this.last_move_col, this.last_move_coin)
            || diagonalMatch(this.game_state, this.last_move_row, this.last_move_col, this.last_move_coin)) {
            return true;
        }
        return false;
    }
}
