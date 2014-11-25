class LightFilter implements IUpdate, IFilter {
    private _map : MapManager;
    private _lightSource = new Vector(0, 0);
    private _polygons = [];

    private _worker = new Worker("core/workers/lighting.js");
    private _workerWorking = false;

    private _visionImage : HTMLImageElement;

    constructor (map : MapManager) { //TODO: hmmm.. just only segments will do?
        this._map = map;

        var self = this;
        this._worker.onmessage = function (e) {
            self._workerWorking = false;
            self._polygons = e.data;
        };

        ResourceManager.retrieveImage('vision', (img : HTMLImageElement) => {
            self._visionImage = img;
        });
    }

    setLightSource (lightSource : Vector) {
        this._lightSource = lightSource;
    }

    init (ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(camera.view.x, camera.view.y, canvas.width, canvas.height);
        this.draw(ctx);

        ctx.globalCompositeOperation = 'source-atop';
    }

    close (ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.globalCompositeOperation = 'source-over';
    }

    update (dt : number) {
        if (!this._workerWorking) {
            this._worker.postMessage({
                x: this._lightSource.x,
                y: this._lightSource.y,
                s: this._map.segments
            });
            this._workerWorking = true;
        }
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
    }

    draw (ctx) {
        for (var i = 1; i < this._polygons.length; i++) {
            this.drawPolygon(this._polygons[i], ctx, "rgba(0,0,0,0.2)");
        }
        if (this._polygons.length > 0) { //TODO: hmmm...
            this.drawPolygon(this._polygons[0], ctx, "#000");
        }

        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(this._visionImage, this._lightSource.x - 900, this._lightSource.y - 900, 1800, 1800); //TODO: better scale vision
    }

    private drawPolygon (polygon, ctx, fillStyle) { //TODO: hmmm....
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo(polygon[0].x, polygon[0].y);
        for (var i = 1; i < polygon.length; i++) {
            var intersect = polygon[i];
            ctx.lineTo(intersect.x, intersect.y);
        }
        ctx.fill();
    }
}