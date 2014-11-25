class RenderSystem implements ISystem {
    private _entities : Entity[] = [];
    private _renderer : CanvasRenderer;
    private _lighting : LightFilter;


    constructor (renderer : CanvasRenderer, lighting? : LightFilter) {
        this._renderer = renderer;
        this._lighting = lighting;
    }

    add (entity : Entity) {
        if(entity.hasComponent(Material)) {
            this._entities.push(entity);
        }
    }

    update (dt : number) {
        if(typeof this._lighting !== 'undefined') { //TODO: hmmm...
            this._lighting.update(dt);
        }

        this._entities.sort((a : Entity, b : Entity) => { //TODO: hmmm... could be optimized
            return a.components.material.zIndex - b.components.material.zIndex;
        });

        this._renderer.render(this._entities);
    }

}