import { NotificationMessage , UserActionMessage } from "../models/types.js"
import { Game } from './game.js'


const winning_message = 'You Won !!!'
const next_try_message = 'The other player won :) , Ask for a re-match !! '


export class MessageHandler {

    static endOfGameMessages(connections: Map<string, WebSocket>, game : Game) {
        let winner;
        let runner;

        if (game.isUser1Turn) {
            winner = game.getUser1Connection(connections)
            runner = game.getUser2Connection(connections)
        } else {
            winner = game.getUser1Connection(connections)
            runner = game.getUser2Connection(connections)
        }
        winner.send(JSON.stringify({
            type: 'result',
            message: winning_message,
        }))

        runner.send(JSON.stringify({
            type: 'result',
            message: next_try_message
        }))
    }

    static sendBoardUpdateMessages(connections: Map<string, WebSocket>, game : Game, userNotification : UserActionMessage) {
        game.getUser1Connection(connections).send(JSON.stringify(userNotification))
        game.getUser2Connection(connections).send(JSON.stringify(userNotification))

        if (game.isWinningMove()) {
            return this.endOfGameMessages(connections, game)
        }

        const start_your_turn : NotificationMessage = {
            'type': 'take_turn',
            message: 'Your turn now !'
        }
        const next_user_connectionId : string = game.handleNextUserTurn()
        connections.get(next_user_connectionId).send(JSON.stringify(start_your_turn));
    }
}
