class RenderSystem implements ISystem {
    private _entities : Entity[] = [];
    private _renderer : Drawer;


    constructor (renderer : Drawer) {
        this._renderer = renderer;
    }

    add (entity : Entity) {
        this._entities.push(entity);
    }

    update (dt : number) {
        this._renderer.render(this._entities);
    }

}