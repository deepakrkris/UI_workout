import 'https://code.jquery.com/jquery-3.6.0.min.js'
import { UserActionMessage, GameSessionMessage, NotificationMessage } from '../models/types.js'
import { ClientConnection } from './client_state.js'

const join_btn = document.getElementById('join_btn');

join_btn.addEventListener('click', function(event: MouseEvent) {
    const userId_e = document.getElementById('userId') as HTMLInputElement | null
    const gameCode_e = document.getElementById('gameCode') as HTMLInputElement | null
    const client_state = ClientConnection.client_state
    client_state.userId = userId_e.value
    client_state.gameCode = gameCode_e.value

    const join_game : GameSessionMessage = {
        userId : client_state.userId,
        gameCode : client_state.gameCode,
        type : 'session',
    }
    ClientConnection.send(join_game)
})

function handleUserClickAction(target : HTMLElement) {
    const row_clicked : number = parseInt(target.attributes.getNamedItem('row').value)
    const side : string = target.attributes.getNamedItem('side').value
    const client_state = ClientConnection.client_state

    const message : UserActionMessage = {
        row: row_clicked,
        coin: client_state.coin,
        gameCode: client_state.gameCode,
        side,
        userId: client_state.userId,
    }
  
    console.log('sending message')
    ClientConnection.send(message)
}

export function leftGridListener({ target }) {
    console.log(" left clicked ")

    if (target.className == 'click_position') {
        handleUserClickAction(target)
        $('#left-side-container').off('click')
        $('#right-side-container').off('click')
    }
}

export function rightGridListener({ target }) {
    console.log(" right clicked ")

    if (target.className == 'click_position') {
        handleUserClickAction(target)
        $('#left-side-container').off('click')
        $('#right-side-container').off('click')
    }
}

export function handleUserActionNotification(data : UserActionMessage) {
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

export function handleGameSessionNotification(data : GameSessionMessage) {
    const client_state = ClientConnection.client_state
    client_state.coin = data.coin
    $('.bodyTable').show();
}

export function handleGameNotification(data : NotificationMessage) {
    if (data.type == 'take_turn') {
        $('#left-side-container').on('click', leftGridListener)
        $('#right-side-container').on('click', rightGridListener)
    }
}

/*
$(".click_position").each((_, click_position) => {
    const row_clicked : number = parseInt(click_position.attributes.getNamedItem('row').value)
    const side : string = click_position.attributes.getNamedItem('side').value
    click_position.addEventListener('click', (ev : MouseEvent) => {

    })
})*/
