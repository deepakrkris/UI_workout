export interface GameState {
    gameCode : string,
    user1? : string,
    user2? : string,
    status: string,
    board : string[][],
}

export interface ClientState {
    gameCode? : string,
    userId? : string,
    coin? : string,
}

export interface UserActionMessage {
    gameCode : string,
    row : number,
    col? : number,
    coin : string,
}

export interface GameSessionMessage {
    userId : string,
    gameCode : string,
    coin? : string,
}

export function isGameSessionMessage(obj: any): obj is GameSessionMessage {
    return 'userId' in obj && 'gameCode' in obj;
}

export function isUserActionMessage(obj: any): obj is UserActionMessage {
    return 'row' in obj && 'coin' in obj;
}
