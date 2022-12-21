import 'https://code.jquery.com/jquery-3.6.0.min.js';
import { SessionMessage , GameMessage, isSessionObject, isGameMessage, NotificationMessage, isNotificationMessage } from './game_types.js';

const webSocket = new WebSocket(location.origin.replace(/^http/, 'ws'));
const message_window = document.getElementById('description');
$("#description").css({ 'color': 'red', 'font-size': '150%' });

let coin = 'U';

$(".board__cell").each((_, cell) => {
    const cellHeight = cell.offsetWidth;
    cell.style.height = `${cellHeight}px`;
});

function coin_selector(value : string) {
    if (!value || value.trim() == "") return "";
    const coin_class = value.trim().toUpperCase() == "X" ? "RED_COIN" : "BLUE_COIN";
    return coin_class;
}

webSocket.onmessage = (event : MessageEvent) => {
  const data : SessionMessage | GameMessage | NotificationMessage = JSON.parse(event.data);

  if (isSessionObject(data)) {
      coin = data.coin;
      message_window.innerHTML = 'Your coin is : ' + coin;
      data.grid.forEach((value, pos) => {
        document.querySelector(
            `[data-id='${pos}']`
          ).innerHTML = `<div class=\"${coin_selector(value)}\"></div>`;
      });
  } else if (isGameMessage(data)) {
      const position = data.position;
      const other_player_coin = data.coin;
      document.querySelector(
          `[data-id='${position}']`
      ).innerHTML = `<div class=\"${coin_selector(other_player_coin)}\"></div>` ;
  } else if (isNotificationMessage(data)) {
      if (data.type == 'result')
        message_window.innerHTML = 'Result arrived : ' + data.message;
      else if (data.type == 'take_turn') {
        message_window.innerHTML = data.message;
        $(".board__container").on("click", gridListener);
      }
  }
};

function gridListener ({target}) {
    let board_address;
    if (target.classList.contains("board__cell")) {
        board_address = target.children[0].dataset.id;
    }

    if (board_address) {
        document.querySelector(
            `[data-id='${board_address}']`
        ).innerHTML = `<div class=\"${coin_selector(coin)}\"></div>`;;
        const data = {'type': 'message', 'coin': coin, 'position': board_address};
        webSocket.send(JSON.stringify(data));
        message_window.innerHTML = "Wait! Other player's turn now";
        $(".board__container").off("click", gridListener);
    }
};

$(".board__container").on("click", gridListener);
