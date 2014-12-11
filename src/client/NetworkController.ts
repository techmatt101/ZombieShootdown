class NetworkController {
    constructor() {
        var ws = new WebSocket('ws://localhost:8080');

        ws.addEventListener('open', () => {
            console.info('Open connection');
            ws.send('hand shake');
        });

        ws.addEventListener('close', () => {
            console.info('Close connection');
        });

        ws.addEventListener('message', (e : MessageEvent) => {
            console.log(e);
        });
    }
}