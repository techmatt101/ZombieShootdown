class DebugTool {
    private _game : Game;

    constructor(game : Game) {
        this._game = game;
    }

    noClip () {
        this._game.player.components.remove(Collision);
        this._game.player.components.build();
    }
}