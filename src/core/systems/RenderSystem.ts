class RenderSystem implements ISystem<Entity> {
    private _entities : Entity[] = [];
    private _renderer : CanvasRenderer;


    constructor(renderer : CanvasRenderer) {
        this._renderer = renderer;
    }

    add(entity : Entity) {
        if (entity.hasComponent(Material)) {
            this._entities.push(entity);
        }
    }

    update(dt : number) {
        this._entities.sort((a : Entity, b : Entity) => { //TODO: hmmm... could be optimized
            return a.components.material.zIndex - b.components.material.zIndex;
        });

        this._renderer.render(this._entities);
    }
}