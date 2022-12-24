import { UserActionMessage, GameSessionMessage, NotificationMessage, isGameSessionMessage, isUserActionMessage, isNotificationMessage, ClientState } from '../models/types.js'
import { handleGameNotification, handleGameSessionNotification, handleUserActionNotification } from './ui_handlers.js'

export class ClientConnection {
    static client_state : ClientState
    static websocket : WebSocket

    static init() {
        this.client_state = {}
    }

    static send(message : GameSessionMessage | UserActionMessage | NotificationMessage ) {
        this.websocket.send(JSON.stringify(message))
    }
}

ClientConnection.client_state = {}
ClientConnection.websocket = new WebSocket(location.origin.replace(/^http/, 'ws'))
ClientConnection.websocket.onmessage = (event : MessageEvent) => {
    const data : UserActionMessage | GameSessionMessage = JSON.parse(event.data)

    // console.log(data)
    if (isUserActionMessage(data)) {
        handleUserActionNotification(data)
    } else if (isGameSessionMessage(data)) {
        handleGameSessionNotification(data)
    } else if (isNotificationMessage(data)) {
        handleGameNotification(data)
    }
}
