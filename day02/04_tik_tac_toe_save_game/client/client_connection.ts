import { SessionMessage , GameMessage, isSessionObject, isGameMessage, NotificationMessage, isNotificationMessage, ClientState, isConnectionMessage } from '../models/game_types.js';
import { handleGameMessage, handleNotificationMessage, handleSessionMessage, handleConnectionMessage } from './ui_handlers.js';

class ClientConnectionHandler {
    static websocket: WebSocket;
    static session : ClientState;
}

function messageHandler (data : SessionMessage | GameMessage | NotificationMessage, session : ClientState) {
    if (isConnectionMessage(data)) {
        handleConnectionMessage(data, session);
    } if (isSessionObject(data)) {
        handleSessionMessage(data, session)
    } else if (isGameMessage(data)) {
        handleGameMessage(data, session);
    } else if (isNotificationMessage(data)) {
        handleNotificationMessage(data, session)
    }
}

export function setup (user1: string, user2: string) {
    if (!ClientConnectionHandler.websocket) {
        ClientConnectionHandler.websocket = new WebSocket(location.origin.replace(/^http/, 'ws'));

        ClientConnectionHandler.session = {
            client: ClientConnectionHandler.websocket,
            user1,
            user2,
        };

        ClientConnectionHandler.websocket.onmessage = (event : MessageEvent) => {
            const data : SessionMessage | GameMessage | NotificationMessage = JSON.parse(event.data);
            messageHandler(data, ClientConnectionHandler.session);
        };
    }
}
