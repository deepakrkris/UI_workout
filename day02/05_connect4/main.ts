import 'https://code.jquery.com/jquery-3.6.0.min.js'
import { UserActionMessage } from './models/types'

const webSocket = new WebSocket(location.origin.replace(/^http/, 'ws'))

$(".click_position").each((_, click_position) => {
    const row_clicked : number = parseInt(click_position.attributes.getNamedItem('row').value)
    click_position.addEventListener('click', (ev : MouseEvent) => {
        webSocket.send(JSON.stringify({
            'type': 'user_action', 
            'position': row_clicked
        }))
    })
})

webSocket.onmessage = (event : MessageEvent) => {
    const data : UserActionMessage = JSON.parse(event.data)
    const row_clicked = data.position

    $('div[id=empty_position]').each((_, empty_position) => {
        const row = parseInt(empty_position.attributes.getNamedItem("row").value)
        const col = parseInt(empty_position.attributes.getNamedItem("col").value)
        if ( row === row_clicked && col === 0 ) {
            empty_position.setAttribute('class', 'RED_COIN');
        }
    })
}
