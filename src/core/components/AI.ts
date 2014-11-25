class AI implements IComponent<ComponentList>, IEntityController {
    active = true;

    private _ai : IAI;

    static reference(components : ComponentList) {
        return components.ai;
    }

    constructor(ai : IAI) {
        this._ai = ai;
    }

    getAI() {
        return this._ai;
    }

    update(dt : number) {
        this._ai.update(dt);
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
    }

    build(components : ComponentList) {
        components.ai = this;
    }
}