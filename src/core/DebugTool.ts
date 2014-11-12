class DebugTool {
    private _game : Game;

    constructor(game : Game) {
        this._game = game;
    }

    noClip () {
        this._game.player.components.collision.active = false;
    }
}