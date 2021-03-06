class CanvasRenderer {
    protected _ctx : CanvasRenderingContext2D;
    protected _canvas : Canvas;
    protected _camera : Camera;
    protected _filters : IFilter[] = [];
    protected _entities : Entity[] = [];


    constructor(canvas : Canvas, camera : Camera) {
        this._canvas = canvas;
        this._camera = camera;

        canvas.context = canvas.element.getContext('2d');
        this._ctx = canvas.context;
    }

    getCtx() {
        return this._ctx;
    }

    addFilter(filter : IFilter) {
        this._filters.push(filter);
    }

    render(entities : Entity[]) {
        this._entities = entities;
    }

    paint() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.scale(this._camera.zoom, this._camera.zoom);
        this._ctx.translate(~~-this._camera.viewport.pos.x, ~~-this._camera.viewport.pos.y);

        for (var i = 0; i < this._filters.length; i++) {
            this._filters[i].init(this._ctx, this._canvas, this._camera);
        }

        this._ctx.fillStyle = '#000';

        for (var i = 0; i < this._entities.length; i++) {
            if (this._entities[i].hasActiveComponent(Material)) { //TODO: hmmm...
                this.drawEntity(this._entities[i]);
            }
        }

        for (var i = 0; i < this._filters.length; i++) {
            this._filters[i].close(this._ctx, this._canvas, this._camera);
        }

        this._ctx.translate(~~this._camera.viewport.pos.x, ~~this._camera.viewport.pos.y);
        this._ctx.scale(1 / this._camera.zoom, 1 / this._camera.zoom);
    }

    protected drawEntity(entity : Entity) {
        var texture = entity.components.material.texture;

        this._ctx.save();
        this._ctx.rotate(entity.pos.direction);

        var rx = Math.cos(-entity.pos.direction),
            ry = Math.sin(-entity.pos.direction);

        if (texture === null) {
            this._ctx.fillRect(
                (entity.pos.x * rx - entity.pos.y * ry) - entity.geometry.width / 2,
                (entity.pos.y * rx + entity.pos.x * ry) - entity.geometry.height / 2,
                entity.geometry.width, entity.geometry.height
            );
        } else {
            this._ctx.drawImage(
                texture.img,
                texture.sourcePos.x, texture.sourcePos.y,
                texture.sourceWidth, texture.sourceHeight,
                ((entity.pos.x * rx - entity.pos.y * ry) - entity.geometry.width / 2) + texture.pos.x,
                ((entity.pos.y * rx + entity.pos.x * ry) - entity.geometry.height / 2) + texture.pos.y,
                texture.width, texture.height
            );
        }

        this._ctx.restore();
    }
}