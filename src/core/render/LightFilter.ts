class LightFilter implements IUpdate, IFilter {
    private _segments = [];
    private _lightSource = new Vector(0, 0);
    private _polygons = [];

    private _worker = new Worker("core/workers/lighting.js");
    private _workerWorking = false;

    private _visionImage : HTMLImageElement;

    constructor (boundary : Box) {
        var segmentsWidth = boundary.width;
        var segmentsHeight = boundary.height;

        this._segments = [
            // Border
            {a: {x: 0, y: 0}, b: {x: segmentsWidth, y: 0}},
            {a: {x: segmentsWidth, y: 0}, b: {x: segmentsWidth, y: segmentsHeight}},
            {a: {x: segmentsWidth, y: segmentsHeight}, b: {x: 0, y: segmentsHeight}},
            {a: {x: 0, y: segmentsHeight}, b: {x: 0, y: 0}},
        ];

        var self = this;
        this._worker.onmessage = function (e) {
            self._workerWorking = false;
            self._polygons = e.data;
        };

        ResourceManager.retrieveImage('vision', (img : HTMLImageElement) => {
            self._visionImage = img;
        });
    }

    getSegments() {
        return this._segments;
    }

    setLightSource (lightSource : Vector) {
        this._lightSource = lightSource;
    }

    loadBlocks (tiles : Entity[]) {
        for (var i = 0; i < tiles.length; i++) {
            if (tiles[i].id === 'WALL Tile' && tiles[i].pos.x !== 0 && tiles[i].pos.y !== 0 && tiles[i].pos.x !== 928 && tiles[i].pos.y !== 992) {
                this._segments = this._segments.concat(tiles[i].geometry.toPolygon());
                console.log("TILE");
            }
        }
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
                s: this._segments
            });
            this._workerWorking = true;
        }
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
    }

    draw (ctx) {
        for (var i = 1; i < this._polygons.length; i++) {
            drawPolygon(this._polygons[i], ctx, "rgba(0,0,0,0.2)");
        }

        if (this._polygons.length > 0) {
            drawPolygon(this._polygons[0], ctx, "#000");
        }

        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(this._visionImage, this._lightSource.x - 900, this._lightSource.y - 900, 1800, 1800); //TODO: better scale vision
    }
}

function drawPolygon (polygon, ctx, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    for (var i = 1; i < polygon.length; i++) {
        var intersect = polygon[i];
        ctx.lineTo(intersect.x, intersect.y);
    }
    ctx.fill();
}