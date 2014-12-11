/// <reference path="server-ref" />
declare var Config : any;
var port = 1337;
var ws = new WebSocket('ws://localhost:' + port);
var controller = new MessageController();

ws.addEventListener('open', () => {
    console.info('Server has started on ' + port)
});

ws.addEventListener('close', () => {
    console.info('Server has closed');
});

ws.addEventListener('message', (e : MessageEvent) => {
    console.log(e);

    var action = controller[e.data.type];
    if(typeof action === 'undefined') {
        action(e.data);
    } else {
        console.error("Invalid Message Type");
    }
});