import 'https://code.jquery.com/jquery-3.6.0.min.js';
import { SessionMessage , GameMessage, NotificationMessage, ClientState, ConnectionMessage } from '../models/game_types.js';

const message_window = document.getElementById('description');

function coin_selector(value : string) {
    if (!value || value.trim() == "") return "";
    const coin_class = value.trim().toUpperCase() == "X" ? "RED_COIN" : "BLUE_COIN";
    return coin_class;
}

export function handleGridAction(session : ClientState, board_address) {
    document.querySelector(
        `[data-id='${board_address}']`
    ).innerHTML = `<div class=\"${coin_selector(session.coin)}\"></div>`;
    const data : GameMessage = {
        'type': 'message',
        'coin': session.coin,
        'position': board_address,
        'gameId': session.gameId,
        'userId': session.userId,
    };
    session.client.send(JSON.stringify(data));
    message_window.innerHTML = "Wait! Other player's turn now";
    $(".board__container").off("click");
}

function setupGridListener(session : ClientState) {
    return function gridListener({target}) {
        let board_address;
        if (target.classList.contains("board__cell")) {
            board_address = target.children[0].dataset.id;
        }
        if (board_address) {
            handleGridAction(session, board_address);
        }
    };
}

export function handleConnectionMessage(messg : ConnectionMessage, session : ClientState) {
    const data : SessionMessage = {
        'type': 'session_begin',
        'user1': session.userId,
        'user2': session.peerUserId,
        'connectionid': messg.connectionid,
    };
    session.client.send(JSON.stringify(data));
}

export function handleSessionMessage(message : SessionMessage, session : ClientState) {
    session.gameId = message.gameId;
    session.coin = message.coin;
    session.gridListener = setupGridListener(session);
    console.log("handleSessionMessage", message, session);
    message_window.innerHTML = ' ' + `<div class=\"${coin_selector(session.coin)}\">Your coin is :</div>`;
    message.grid.forEach((value, pos) => {
        document.querySelector(
          `[data-id='${pos}']`
        ).innerHTML = `<div class=\"${coin_selector(value)}\"></div>`;
    });
    $(".board__container").on("click", session.gridListener);
}

export function handleGameMessage(data : GameMessage, session : ClientState) {
    console.log("handleGameMessage", data, session)
    const position = data.position;
    const other_player_coin = data.coin;
    document.querySelector(
        `[data-id='${position}']`
    ).innerHTML = `<div class=\"${coin_selector(other_player_coin)}\"></div>` ;
}

export function handleNotificationMessage(data : NotificationMessage, session : ClientState) {
    console.log("handleNotificationMessage", data, session)
    if (data.type == 'result')
        message_window.innerHTML = 'Result arrived : ' + data.message;
    else if (data.type == 'take_turn') {
        message_window.innerHTML = data.message;
        $(".board__container").on("click", session.gridListener);
    }
}
