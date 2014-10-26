class AI implements IComponent {
    private _ai : IAI;


    constructor(ai : IAI) {
        this._ai = ai;
    }

    update(dt : number) {
        this._ai.update(dt);
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }
}