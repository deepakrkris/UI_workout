import 'https://code.jquery.com/jquery-3.6.0.min.js';

$(".click_position").each((_, click_position) => {
    const row_clicked : number = parseInt(click_position.attributes.getNamedItem('row').value);
    click_position.addEventListener('mouseenter', (ev : MouseEvent) => {
        $('div[id=empty_position]').each((_, empty_position) => {
            const row = parseInt(empty_position.attributes.getNamedItem("row").value);
            const col = parseInt(empty_position.attributes.getNamedItem("col").value);
            if ( row === row_clicked && col === 0 ) {
                empty_position.setAttribute('class', 'RED_COIN');
            }
        });
    });

    click_position.addEventListener('mouseleave', (ev : MouseEvent) => {
        $('div[id=empty_position]').each((_, empty_position) => {
            const row = parseInt(empty_position.attributes.getNamedItem("row").value);
            const col = parseInt(empty_position.attributes.getNamedItem("col").value);
            if ( row === row_clicked && col === 0 ) {
                empty_position.setAttribute('class', 'empty_position');
            }
        });
    });
});
