/// <reference path="ref" />
/// <reference path="Game" />
declare var Config : any;
var ui : InterfaceController = null;
var game : Game = null;

window.onload = () => {
    ui = new InterfaceController();
};

function gameSetup () {
    console.time("GameSetup");
    game = new Game();
    console.timeEnd("GameSetup");
    game.load();
}