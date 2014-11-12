class Drawer { //TODO: better name
    private _canvas : Canvas;
    private _camera : Camera;
    private _ctx : CanvasRenderingContext2D;


    constructor (canvas : Canvas, camera : Camera) {
        this._canvas = canvas;
        this._camera = camera;

        canvas.context = canvas.element.getContext('2d');
        // disable pixel smoothing
        canvas.context.imageSmoothingEnabled = false;
        canvas.context.mozImageSmoothingEnabled = false;
        canvas.context.oImageSmoothingEnabled = false;
        canvas.context.webkitImageSmoothingEnabled = false;

        this._ctx = canvas.context;
    }

    getCtx() {
        return this._ctx;
    }

    render (entity : Entity[]) {
        // Clear Canvas
        this._ctx.fillStyle = "#000";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this._ctx.fillStyle = '#fff';
        this._ctx.translate(~~this._camera.view.x, ~~this._camera.view.y);

        var rx, ry;
        for (var i = 0; i < entity.length; i++) {
            this._ctx.save();
            this._ctx.rotate(entity[i].pos.angle);

            rx = Math.cos(-entity[i].pos.angle);
            ry = Math.sin(-entity[i].pos.angle);

            if(entity[i].texture == null) {
                this._ctx.fillRect(
                    (entity[i].pos.x * rx - entity[i].pos.y * ry) - entity[i].geometry.width / 2,
                    (entity[i].pos.y * rx + entity[i].pos.x * ry) - entity[i].geometry.height / 2,
                    entity[i].geometry.width, entity[i].geometry.height
                );
            } else {
                this._ctx.drawImage(
                    entity[i].texture.img,
                    entity[i].texture.pos.x, entity[i].texture.pos.y,
                    entity[i].texture.width, entity[i].texture.height,
                    (entity[i].pos.x * rx - entity[i].pos.y * ry) - entity[i].geometry.width / 2,
                    (entity[i].pos.y * rx + entity[i].pos.x * ry) - entity[i].geometry.height / 2,
                    entity[i].geometry.width, entity[i].geometry.height
                );
            }

            this._ctx.restore();
        }

        if(Config.debug){
            for (var i = 0; i < entity.length; i++) {
                this._ctx.save();
                entity[i].drawDebug(this._ctx);
                this._ctx.restore();
            }
        }

        this._ctx.translate(~~-this._camera.view.x, ~~-this._camera.view.y);
    }
}