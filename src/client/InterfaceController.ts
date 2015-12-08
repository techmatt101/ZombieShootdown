class InterfaceController implements IUpdate {
    private _ui : IUI;
    private _game : Game;


    constructor() {
        this._ui = new MenuInterface();
    }

    loaded(game : Game) {
        this._game = game;
        this._ui = new GameInterface(game);
    }

    update(dt : number) {
        this._ui.update(dt);
    }

    paint(ctx : CanvasRenderingContext2D) {
        this._ui.paint(ctx);
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        this._ui.drawDebug(ctx);
    }
}