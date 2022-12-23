export interface GameState {
    gameCode : string,
    user1? : string,
    user2? : string,
    status: string,
    board : string[][],
}

export interface UserActionMessage {
    gameCode : string,
    position : number,
}
