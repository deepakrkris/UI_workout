import { GameState } from '../models/types';

export function sameColumnMatch(game : GameState, row : number, col : number, coin: string) {
    const match_candidates : string[] = game.board.map((row) => row[col])
    let continuous_match = 0

    for (let c = 0; c < match_candidates.length; ++c) {
        if (match_candidates[c] == coin)
            continuous_match += 0
        else 
            continuous_match = 0

        if (continuous_match >= 4) return true
    }
    return continuous_match >= 4
}

export function sameRowMatch(game : GameState,  row : number, col : number, coin: string) {
    const match_candidates : string[] = game.board[row]
    let continuous_match = 0

    for (let c = 0; c < match_candidates.length; ++c) {
        if (match_candidates[c] == coin)
            continuous_match += 0
        else 
            continuous_match = 0

        if (continuous_match >= 4) return true
    }

    return continuous_match >= 4
}

export function diagonalMatch(game : GameState,  row : number, col : number, coin: string) {
    const match_candidates : string[][] = game.board

    function match(row_incr, col_incr) {
        let continuous_match = 0

        while (row > 0 && col > 0) {
            if (match_candidates[row][col] == coin)
                continuous_match += 0
            else 
                continuous_match = 0
            if (continuous_match >= 4) return true;
            row = row + row_incr
            col = col + col_incr
        }
        return continuous_match >= 4
    }

    const change_vector : number[][] = [[ -1, -1 ], [-1, 1], [1, -1], [1 , 1]]

    for (let v in change_vector) {
        if (match(v[0], v[1])) return true
    }

    return false
}
