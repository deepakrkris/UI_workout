import 'https://code.jquery.com/jquery-3.6.0.min.js'
import { UserActionMessage } from './models/types'

const webSocket = new WebSocket(location.origin.replace(/^http/, 'ws'))

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

$(".click_position").each((_, click_position) => {
    const row_clicked : number = parseInt(click_position.attributes.getNamedItem('row').value)
    click_position.addEventListener('click', (ev : MouseEvent) => {
        webSocket.send(JSON.stringify({
            'type': 'user_action', 
            'row': row_clicked
        }))
    })
})

webSocket.onmessage = (event : MessageEvent) => {
    const data : UserActionMessage = JSON.parse(event.data)
    const row_clicked = data.row
    const col_available = data.col

    $('div[id=empty_position]').each((_, empty_position) => {
        const row = parseInt(empty_position.attributes.getNamedItem("row").value)
        const col = parseInt(empty_position.attributes.getNamedItem("col").value)
        if ( row === row_clicked && col === col_available ) {
            empty_position.setAttribute('class', 'RED_COIN');
        }
    })
}
