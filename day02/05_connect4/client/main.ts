import 'https://code.jquery.com/jquery-3.6.0.min.js'
import { generateGrid } from './util.js';
import { ClientConnection } from './client_state.js';
import { leftGridListener, rightGridListener } from './ui_handlers.js'

generateGrid()

ClientConnection.init()

$('#left-side-container').on('click', leftGridListener)
$('#right-side-container').on('click', rightGridListener)
$('.bodyTable').css('display','none');
