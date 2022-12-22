import 'https://code.jquery.com/jquery-3.6.0.min.js';
import { setup } from './client_connection.js';
import { Game } from './game_types.js';

const join_btn = document.getElementById('join_btn');

join_btn.setAttribute('disabled', 'true');

join_btn.addEventListener('click', function(event: MouseEvent) {
    const user1_e = document.getElementById('user1') as HTMLInputElement | null;
    const user2_e = document.getElementById('user2') as HTMLInputElement | null;
    const user1 : string = user1_e.value;
    const user2 : string = user2_e.value;
    const game : CustomEventInit<Game> = {
        detail : {
            user1,
            user2,
        },
    };
    var game_event = new CustomEvent("setup_server_connection", game);
    document.dispatchEvent(game_event);
});

document.addEventListener("setup_server_connection", function(e : CustomEventInit<Game>) {
    setup(e.detail.user1, e.detail.user2);
 });

const fields = ['user1', 'user2', 'name'];

fields.forEach((field_name) => {
    const field = document.getElementById(field_name);
    field.addEventListener('keyup', function(event) {
        const all_fields_entered = fields.every((f) => {
            const element = document.getElementById(f) as HTMLInputElement | null;
            const flag = element.value != '' && element.value.length >= parseInt(element.getAttribute('minlength'));
            return flag;
        });
        if (all_fields_entered) {
            join_btn.removeAttribute('disabled');
        }
    });
});

$(".board__cell").each((_, cell) => {
    const cellHeight = cell.offsetWidth;
    cell.style.height = `${cellHeight}px`;
});
