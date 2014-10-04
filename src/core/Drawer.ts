/// <reference path="Entity.ts" />
/// <reference path="../lib/Canvas.ts" />

class Drawer { //TODO: better name

    private _canvas : Canvas;
    private _ctx : CanvasRenderingContext2D;

    constructor (canvas : Canvas) {
        this._canvas = canvas;
        this._ctx = canvas.context;
    }

    render (entity : Entity[]) {
        //Clear fix
        this._ctx.fillStyle = "#000";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        //this._ctx.fillStyle = '#444';
        //for (var i = 0; i < entity.length; i++) {
        //    this._ctx.fillRect(entity[i].pos.x, entity[i].pos.y, entity[i].width, entity[i].height);
        //}

        for (var i = 0; i < entity.length; i++) {
            this._ctx.fillStyle = '#fff';
            this._ctx.save();
            entity[i].drawDebug(this._ctx);
            this._ctx.restore();
        }

        return this._ctx;
    }
}