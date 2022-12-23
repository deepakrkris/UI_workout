import 'https://code.jquery.com/jquery-3.6.0.min.js';

const webSocket = new WebSocket(location.origin.replace(/^http/, 'ws'));

$(".click_position").each((_, click_position) => {
    const row_clicked : number = parseInt(click_position.attributes.getNamedItem('row').value)
    click_position.addEventListener('click', (ev : MouseEvent) => {
        webSocket.send(JSON.stringify({
            'type': 'user_action', 
            'position': row_clicked
        }))
    })
})
