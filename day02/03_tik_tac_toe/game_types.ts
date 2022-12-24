export interface ClientSession {
    client : WebSocket,
    coin : string,
};

export interface GameMessage {
    coin : string,
    position : number,
};

export interface NotificationMessage {
    type : string,
    message : string,
};

export interface SessionMessage {
    type : string,
    coin : string,
    grid : string[],
};

export function isSessionObject(obj: any): obj is SessionMessage {
    return 'grid' in obj && obj.type == 'session';
}

export function isGameMessage(obj: any): obj is GameMessage {
    return 'position' in obj && obj.type == 'message';
}

export function isNotificationMessage(obj: any): obj is NotificationMessage {
    return 'message' in obj && (obj.type == 'result' || obj.type == 'take_turn');
}
