/// <reference path="ref" />
/// <reference path="client/Game" />

/// <reference path="client/BunnyTest" />
/// <reference path="client/BunnyTesterGame" />


declare var Config : any;
var ui : InterfaceController = null;
var game : any = null;
var debug : DebugTool = null;

window.addEventListener('load',() => {
    ui = new InterfaceController();
});

function gameSetup () {
    console.time("GameSetup");
    game = new Game();
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