/// <reference path="CanvasRenderer" />

class CanvasLightRenderer extends CanvasRenderer {
    private _lighting : LightRays;


    constructor (canvas : Canvas, camera : Camera, lighting? : LightRays) {
        super(canvas, camera);
        this._lighting = lighting;

        // disable pixel smoothing
        canvas.context.imageSmoothingEnabled = false;
        canvas.context.mozImageSmoothingEnabled = false;
        canvas.context.oImageSmoothingEnabled = false;
        canvas.context.webkitImageSmoothingEnabled = false;
    }

    render (entities : Entity[]) {
        this._ctx.globalCompositeOperation = 'source-over';
        this._ctx.fillStyle = '#000';
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        this._ctx.translate(~~-this._camera.view.x, ~~-this._camera.view.y);

        if(typeof this._lighting !== 'undefined') {
            //this._ctx.globalCompositeOperation = 'destination-in';
            this._ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this._ctx.fillRect(this._camera.view.x, this._camera.view.y, this._canvas.width, this._canvas.height);
            //this._ctx.fillRect(100, 100, 300, 300);
            this._lighting.draw(this._ctx);
            this._ctx.globalCompositeOperation = 'source-atop';
        }

        for (var i = 0; i < entities.length; i++) {
            if(entities[i].hasActiveComponent(Material)) { //TODO: hmmm...
                this.drawEntity(entities[i]);
            }
        }

        if(Config.debug){
            this.drawDebug(entities);
        }
        this._ctx.translate(~~this._camera.view.x, ~~this._camera.view.y);
    }
}