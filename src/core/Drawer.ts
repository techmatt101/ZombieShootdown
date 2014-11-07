class Drawer { //TODO: better name
    private _canvas : Canvas;
    private _ctx : CanvasRenderingContext2D;


    constructor (canvas : Canvas) {
        this._canvas = canvas;

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

    render (entity : Entity[], camera : Camera) {
        // Clear Canvas
        this._ctx.fillStyle = "#000";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this._ctx.fillStyle = '#fff';
        this._ctx.translate(~~camera.view.x, ~~camera.view.y);

        for (var i = 0; i < entity.length; i++) {
            this._ctx.save();
            this._ctx.translate(entity[i].pos.x, entity[i].pos.y);
            this._ctx.rotate(entity[i].pos.angle);

            this._ctx.fillRect(-entity[i].texture.width / 2, -entity[i].texture.height / 2, entity[i].texture.width, entity[i].texture.height);
            //this._ctx.drawImage(entity[i].pos.x, entity[i].pos.y, entity[i].width, entity[i].height);

            this._ctx.restore();
        }

        if(Config.debug){
            for (var i = 0; i < entity.length; i++) {
                this._ctx.save();
                entity[i].drawDebug(this._ctx);
                this._ctx.restore();
            }
        }

        this._ctx.translate(~~-camera.view.x, ~~-camera.view.y);
    }
}