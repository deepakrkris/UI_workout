import 'https://code.jquery.com/jquery-3.6.0.min.js'
import { UserActionMessage, GameSessionMessage, NotificationMessage, isGameSessionMessage, isUserActionMessage, isNotificationMessage, ClientState } from './models/types.js'

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
    client_state.userId = userId_e.value
    client_state.gameCode = gameCode_e.value

    const join_game : GameSessionMessage = {
        userId : client_state.userId,
        gameCode : client_state.gameCode,
        type : 'session',
    }
    webSocket.send(JSON.stringify(join_game))
})

function handleUserClickAction(target : HTMLElement) {
    const row_clicked : number = parseInt(target.attributes.getNamedItem('row').value)
    const side : string = target.attributes.getNamedItem('side').value

    console.log(" clicked " , row_clicked, side)

    const message : UserActionMessage = {
        row: row_clicked,
        coin: client_state.coin,
        gameCode: client_state.gameCode,
        side,
        userId: client_state.userId,
    }
    webSocket.send(JSON.stringify(message))
}

function gridListener({ target }) {
    if (target.className == 'click_position') {
        handleUserClickAction(target)
        $('#left-side-container').off('click')
        $('#right-side-container').off('click')
    }
}

$('#left-side-container').on('click', gridListener)
$('#right-side-container').on('click', gridListener)

/*
$(".click_position").each((_, click_position) => {
    const row_clicked : number = parseInt(click_position.attributes.getNamedItem('row').value)
    const side : string = click_position.attributes.getNamedItem('side').value
    click_position.addEventListener('click', (ev : MouseEvent) => {

    })
})*/

function handleUserActionNotification(data : UserActionMessage) {
    const row_clicked = data.row
    const col_available = data.col

    $('div[id=empty_position]').each((_, empty_position) => {
        const row = parseInt(empty_position.attributes.getNamedItem("row").value)
        const col = parseInt(empty_position.attributes.getNamedItem("col").value)
        if ( row === row_clicked && col === col_available ) {
            empty_position.setAttribute('class', data.coin);
        }
    })
}

function handleGameSessionNotification(data : GameSessionMessage) {
    client_state.coin = data.coin
}

function handleGameNotification(data : NotificationMessage) {
    if (data.type == 'take_turn') {
        $('#left-side-container').on('click', gridListener)
        $('#right-side-container').on('click', gridListener)
    }
}

webSocket.onmessage = (event : MessageEvent) => {
    const data : UserActionMessage | GameSessionMessage = JSON.parse(event.data)

    console.log(data)

    if (isUserActionMessage(data)) {
        handleUserActionNotification(data)
    } else if (isGameSessionMessage(data)) {
        handleGameSessionNotification(data)
    } else if (isNotificationMessage(data)) {
        handleGameNotification(data)
    }
}
