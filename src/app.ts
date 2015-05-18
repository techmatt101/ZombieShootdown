declare var Config : any;
var ui : InterfaceController = null;
var game : any = null;
var debug : DebugTool = null;

window.addEventListener('load',() => {
    ui = new InterfaceController();
});

function singlePlayerGameSetup () {
    console.time("GameSetup");
    game = new SinglePlayerGame();
    console.timeEnd("GameSetup");
    game.load();

    if(Config.debug) {
        debug = new DebugTool(game);
    }
}

function bunnyTestSetup() {
    game = new BunnyTesterGame();
    game.load();
}