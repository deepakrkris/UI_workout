import { GameState } from '../models/game_types';

function sameColumnMatch(game : GameState, last_move : number, coin: string) {
    const column = last_move % 3;
    const match_candidate = [
        game.coin_data[column + 0],
        game.coin_data[column + 3],
        game.coin_data[column + 6],
    ];
    return match_candidate.every((value) => value === coin);
}

function sameRowMatch(game : GameState, last_move : number, coin: string) {
    const row_offset = Math.floor(last_move/3) * 3;
    const match_candidate = [
        game.coin_data[row_offset + 0],
        game.coin_data[row_offset + 1],
        game.coin_data[row_offset + 2],
    ];
    return match_candidate.every((value) => value === coin);
}

function diagonalMatch(game : GameState, last_move : number, coin: string) {
    const diagonals = [[0, 4, 8], [2, 4, 6]];
    if (last_move == 0 || last_move == 2 || last_move == 6 || last_move == 8) {
        const result = diagonals.filter((indexes) => {
            return indexes.every((i) => game.coin_data[i] === coin);
        });
        return result.length ? true : false;
    }
    return false;
}

export function isWinningMove(game : GameState, last_move : number, coin: string) : boolean {
    if (sameRowMatch(game, last_move, coin) || sameColumnMatch(game, last_move, coin) || diagonalMatch(game, last_move, coin)) {
        return true;
    }
    return false;
}
