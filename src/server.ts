var port = 1337;

var ws = new WebSocket('ws://localhost:' + port);

ws.addEventListener('open', () => {
    console.info('Server has started on ' + port)
});

ws.addEventListener('message', (e : MessageEvent) => {
    console.log(e);
});

ws.addEventListener('close', () => {
    console.info('Server has closed');
});

function load () {

}