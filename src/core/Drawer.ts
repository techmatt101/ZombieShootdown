/// <reference path="Entity.ts" />
/// <reference path="../lib/Canvas.ts" />

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

    render (entity : Entity[]) {
        //Clear fix
        this._ctx.fillStyle = "#000";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        //this._ctx.fillStyle = '#444';
        //for (var i = 0; i < entity.length; i++) {
        //    this._ctx.fillRect(entity[i].pos.x, entity[i].pos.y, entity[i].width, entity[i].height);
        //}

        this._ctx.fillStyle = '#fff';
        this._ctx.strokeStyle = '#f00';

        for (var i = 0; i < entity.length; i++) {
            this._ctx.save();
            entity[i].drawDebug(this._ctx);
            this._ctx.restore();

            this._ctx.rect(entity[i].pos.x, entity[i].pos.y, entity[i].width, entity[i].height);


            //this._ctx.drawImage(entity[i].pos.x, entity[i].pos.y, entity[i].width, entity[i].height);
        }
        this._ctx.stroke();
    }
}