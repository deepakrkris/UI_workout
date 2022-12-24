import 'https://code.jquery.com/jquery-3.6.0.min.js';

interface Task {
    to_string(): string
}

let task = {
    to_string: function() { 
        return "Hello World !!!";
    }
}

function execute(task: Task) {
    $("#description").html( "<B>" + task.to_string() + "</B>");
    $("#description").css({ 'color': 'red', 'font-size': '150%' });
}

export function setColor () {
    execute(task);
}
