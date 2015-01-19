/// <reference path="client-ref" />

declare var Config : any;
var ui : ZombieApp.InterfaceController = null;
var game : any = null;
var debug : ZombieApp.DebugTool = null;

window.addEventListener('load',() => {
    ui = new ZombieApp.InterfaceController();
});

function singlePlayerGameSetup () {
    console.time("GameSetup");
    game = new ZombieApp.SinglePlayerGame();
    console.timeEnd("GameSetup");
    game.load();

    if(Config.debug) {
        debug = new ZombieApp.DebugTool(game);
    }
}

function multiPlayerGameSetup () {
    console.time("GameSetup");
    game = new ZombieApp.MultiPlayerGame();
    console.timeEnd("GameSetup");
    game.load();

    if(Config.debug) {
        debug = new ZombieApp.DebugTool(game);
    }
}

function bunnyTestSetup() {
    game = new ZombieApp.BunnyTesterGame();
    game.load();
}