class Drawer { //TODO: better name
    private _canvas : Canvas;
    private _ctx : CanvasRenderingContext2D;


    constructor (canvas : Canvas) {
        this._canvas = canvas;
        this._ctx = canvas.context;
    }

    getCTX() {
        return this._ctx;
    }

    render (entity : Entity[], camera : Camera) {
        //Clear fix
        this._ctx.fillStyle = "#000";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        //this._ctx.fillStyle = '#444';
        //for (var i = 0; i < entity.length; i++) {
        //    this._ctx.fillRect(entity[i].pos.x, entity[i].pos.y, entity[i].width, entity[i].height);
        //}

        this._ctx.fillStyle = '#fff';
        this._ctx.translate(camera.view.x, camera.view.y);

        for (var i = 0; i < entity.length; i++) {
            this._ctx.save();
            this._ctx.translate(entity[i].pos.x, entity[i].pos.y);
            this._ctx.rotate(entity[i].pos.angle);

            this._ctx.fillRect(-entity[i].width / 2, -entity[i].height / 2, entity[i].width, entity[i].height);
            //this._ctx.drawImage(entity[i].pos.x, entity[i].pos.y, entity[i].width, entity[i].height);

            this._ctx.restore();
        }

        if(Config.debug){
            this._ctx.strokeStyle = '#f00';
            for (var i = 0; i < entity.length; i++) {
                this._ctx.save();
                entity[i].drawDebug(this._ctx);

                if(entity[i].touching) {
                    this._ctx.strokeStyle = '#FFFF00';
                }

                this._ctx.strokeRect(entity[i].pos.x - entity[i].width / 2, entity[i].pos.y - entity[i].height / 2, entity[i].width, entity[i].height);
                this._ctx.restore();
            }
        }

        this._ctx.translate(-camera.view.x, -camera.view.y);
    }
}