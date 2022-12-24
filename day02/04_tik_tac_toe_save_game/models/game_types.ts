export interface GameState {
    user1 : string,
    user2 : string,
    status: string,
    id? : string,
    user1_coin? : string,
    user2_coin? : string,
    coin_data? : string[],
    connections? : string[],
};

export interface ClientState {
    client : WebSocket,
    coin? : string,
    userId? : string,
    peerUserId? : string,
    gameId? : string,
    gridListener? : (e: any) => void,
};

export interface ConnectionMessage {
    type : string,
    connectionid : string,
}

export interface SessionMessage {
    type : string,
    connectionid : string,
    coin? : string,
    user1? : string,
    user2? : string,
    gameId? : string,
    grid? : string[],
};

export interface GameMessage {
    gameId : string,
    userId: string,
    type? : string,
    coin : string,
    position : number,
};

export interface NotificationMessage {
    type : string,
    message : string,
};

export function isConnectionMessage(obj: any): obj is ConnectionMessage {
    return obj.type === 'connection_created';
}

export function isSessionObject(obj: any): obj is SessionMessage {
    return obj.type === 'session_begin' || obj.type === 'session_created';
}

export function isGameMessage(obj: any): obj is GameMessage {
    return 'position' in obj && obj.type === 'message';
}

export function isNotificationMessage(obj: any): obj is NotificationMessage {
    return 'message' in obj && (obj.type === 'result' || obj.type === 'take_turn');
}
