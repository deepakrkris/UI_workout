interface Task {
    to_string(): string
}

let task = {
    to_string: function() { 
        return "Hello World !!!";
    }
}

function execute(task: Task) {
    document.getElementById("description")!.innerHTML = "<B>" + task.to_string() + "</B>";
}

execute(task)
