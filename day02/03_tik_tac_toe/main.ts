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

webSocket.onmessage = (event : MessageEvent) => {
  const data : SessionMessage | GameMessage | NotificationMessage = JSON.parse(event.data);

  if (isSessionObject(data)) {
      coin = data.coin;
      message_window.innerHTML = 'Your coin is : ' + coin;
      data.grid.forEach((value, pos) => {
        document.querySelector(
            `[data-id='${pos}']`
          ).textContent = value;
      });
  } else if (isGameMessage(data)) {
      const position = data.position;
      const other_player_coin = data.coin;
      document.querySelector(
          `[data-id='${position}']`
      ).textContent = other_player_coin;
  } else if (isNotificationMessage(data)) {
      message_window.innerHTML = 'Result arrived : ' + data.message;
  }
};

function gridListener ({target}) {
    let board_address;
    if (target.classList.contains("board__cell")) {
        board_address = target.children[0].dataset.id;
    } else if (target.classList.contains("letter")) {
        board_address = target.dataset.id;
    }

    if (board_address) {
        document.querySelector(
            `[data-id='${board_address}']`
        ).textContent = coin;
        const data = {'type': 'message', 'coin': coin, 'position': board_address};
        webSocket.send(JSON.stringify(data));
    }
};

$(".board__container").on("click", gridListener);
