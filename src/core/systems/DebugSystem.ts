class DebugSystem implements ISystem<Entity> {
    private _enmities : Entity[] = [];
    private _camera : Camera;

    constructor(camera : Camera) {
        this._camera = camera;
    }

    add(entity : Entity) {
        this._enmities.push(entity);
    }

    update(dt : number) {

    }

    paint(ctx : CanvasRenderingContext2D) {
        ctx.scale(this._camera.zoom, this._camera.zoom);
        ctx.translate(~~-this._camera.viewport.pos.x, ~~-this._camera.viewport.pos.y);
        for (var i = 0; i < this._enmities.length; i++) {
            ctx.save();
            this._enmities[i].drawDebug(ctx);
            ctx.restore();
        }
        ctx.translate(~~this._camera.viewport.pos.x, ~~this._camera.viewport.pos.y);
        ctx.scale(1 / this._camera.zoom, 1 / this._camera.zoom);
    }
}