import { Game } from '../models/index.js';
import { getQueryRunner } from "./db_connection.js";
import { SessionMessage , GameMessage, GameState } from '../models/game_types.js';
import { v4 as uuidv4 } from 'uuid';

export async function createOrGetGameSession(data : SessionMessage) : Promise<GameState> {
    const user1 = data.user1;
    const user2 = data.user2;
    const queryRunner = getQueryRunner();

    await queryRunner.connect();
    let games : Game[] = await queryRunner.query((`select * from game where user1 = \'${user1}\' and user2 = \'${user2}\' ORDER BY updated_at DESC Limit 1`));

    if (!games || !games.length) {
        games = await queryRunner.query((`select * from game where user1 = \'${user2}\' and user2 = \'${user1}\' ORDER BY updated_at DESC Limit 1`));
    }

    if (games && games.length) {
        const game = games[0];
        return {
           user1 : game.user1,
           user2 : game.user2,
           user1_coin : game.user1_coin,
           user2_coin : game.user2_coin,
           id : game.id,
           coin_data: JSON.parse(game.data),
           status : 'existing',
        };
    } else {
        const new_game : Game = new Game();
        new_game.user1 = user1;
        new_game.user2 = user2;
        new_game.status = 'existing';
        new_game.user1_coin = 'X';
        new_game.user2_coin = 'O';
        new_game.id = uuidv4();
        const coin_data = ['', '', '', '', '', '', '', '', ''];
        new_game.data = JSON.stringify(coin_data);

        await new_game.save();
        return {
            id : new_game.id,
            user1 : new_game.user1,
            user2 : new_game.user2,
            user1_coin : new_game.user1_coin,
            user2_coin : new_game.user2_coin,
            coin_data: [],
            status: 'new',
        };
    }
}

export async function saveGameMove(message : GameMessage, data : GameState) : Promise<void> {
    const gameId = message.gameId;
    const coin_data = data.coin_data;
    coin_data[message.position] = message.coin;
    const new_game : Game = new Game();
    new_game.id = gameId;
    new_game.data = JSON.stringify(data.coin_data);
    await new_game.save();
}
