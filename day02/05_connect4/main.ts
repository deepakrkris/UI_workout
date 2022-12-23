import 'https://code.jquery.com/jquery-3.6.0.min.js'
import { UserActionMessage, GameSessionMessage, isGameSessionMessage, isUserActionMessage, ClientState } from './models/types.js'

const join_btn = document.getElementById('join_btn');
const webSocket = new WebSocket(location.origin.replace(/^http/, 'ws'))

const client_state : ClientState = {}

function generateRows(row) {
    let row_innerhtml = ""

    for (let col = 0; col < 7; ++col) {
        let html_content = "<div class=\"letter\" ><div class=\"empty_position\" id=\"empty_position\" "
        html_content +=  ` row="${row}" col="${col}"></div></div>`
        row_innerhtml += html_content
    }
    return row_innerhtml
}

for (let row = 0; row < 7; ++row) {
    document.querySelector(
        `[coin-row-id='${row}']` ).innerHTML = generateRows(row)
}

join_btn.addEventListener('click', function(event: MouseEvent) {
    const userId_e = document.getElementById('userId') as HTMLInputElement | null
    const gameCode_e = document.getElementById('gameCode') as HTMLInputElement | null
    const userId : string = userId_e.value
    const gameCode : string = gameCode_e.value
    const join_game : GameSessionMessage = {
        userId,
        gameCode,
    }
    webSocket.send(JSON.stringify(join_game))
})

$(".click_position").each((_, click_position) => {
    const row_clicked : number = parseInt(click_position.attributes.getNamedItem('row').value)
    click_position.addEventListener('click', (ev : MouseEvent) => {
        const message : UserActionMessage = {
            row: row_clicked,
            coin: client_state.coin,
            gameCode: client_state.gameCode,
        }
        webSocket.send(JSON.stringify(message))
    })
})

function handleUserActionNotification(data : UserActionMessage) {
    const row_clicked = data.row
    const col_available = data.col

    $('div[id=empty_position]').each((_, empty_position) => {
        const row = parseInt(empty_position.attributes.getNamedItem("row").value)
        const col = parseInt(empty_position.attributes.getNamedItem("col").value)
        if ( row === row_clicked && col === col_available ) {
            empty_position.setAttribute('class', client_state.coin);
        }
    })
}

function handleGameNotification(data : GameSessionMessage) {
    client_state.coin = data.coin
}

webSocket.onmessage = (event : MessageEvent) => {
    const data : UserActionMessage | GameSessionMessage = JSON.parse(event.data)

    if (isUserActionMessage(data)) {
        handleUserActionNotification(data)
    } else if (isGameSessionMessage(data)) {
        handleGameNotification(data)
    }
}
