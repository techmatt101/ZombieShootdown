class AI implements IComponent<ComponentList>, IEntityController {
    active = true;

    private _ai : IAI;

    static reference(components : ComponentList) {
        return components.controller;
    }

    constructor(ai : IAI) {
        this._ai = ai;
    }


    update(dt : number) {
        this._ai.update(dt);
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

    build(components : ComponentList) {
        components.controller = this;
    }
}