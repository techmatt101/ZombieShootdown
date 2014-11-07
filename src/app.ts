/// <reference path="ref" />
/// <reference path="Game" />
/// <reference path="config" />

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