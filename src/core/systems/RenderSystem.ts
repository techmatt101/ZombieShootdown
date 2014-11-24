class RenderSystem implements ISystem {
    private _entities : Entity[] = [];
    private _renderer : CanvasLightRenderer;
    private _lighting : LightRays;


    constructor (renderer : CanvasLightRenderer, lighting? : LightRays) {
        this._renderer = renderer;
        this._lighting = lighting;
    }

    add (entity : Entity) {
        if(entity.hasComponent(Material)) {
            this._entities.push(entity);
        }
    }

    update (dt : number) {
        if(typeof this._lighting !== 'undefined') {
            this._lighting.update(dt);
        }
        this._renderer.render(this._entities);
    }

}