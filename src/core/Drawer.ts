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

    render (entities : Entity[]) {
        // Clear Canvas
        this._ctx.fillStyle = '#000';
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this._ctx.fillStyle = '#fff';
        this._ctx.translate(~~this._camera.view.x, ~~this._camera.view.y);

        var rx, ry;
        for (var i = 0; i < entities.length; i++) {
            if(!entities[i].hasActiveComponent(Material)) { continue; }  //TODO: hmmm...
            var texture = entities[i].components.material.texture;
            this._ctx.save();
            this._ctx.rotate(entities[i].pos.angle);

            rx = Math.cos(-entities[i].pos.angle);
            ry = Math.sin(-entities[i].pos.angle);

            if(texture == null) {
                if(entities[i].id === 'Player') { //TODO: rm HACK
                    this._ctx.fillStyle = '#4184DD';
                }

                this._ctx.fillRect(
                    (entities[i].pos.x * rx - entities[i].pos.y * ry) - entities[i].geometry.width / 2,
                    (entities[i].pos.y * rx + entities[i].pos.x * ry) - entities[i].geometry.height / 2,
                    entities[i].geometry.width, entities[i].geometry.height
                );

                if(entities[i].id === 'Player') { //TODO: rm HACK
                    this._ctx.fillStyle = '#fff';
                }
            } else {
                this._ctx.drawImage(
                    texture.img,
                    texture.pos.x, texture.pos.y,
                    texture.width, texture.height,
                    (entities[i].pos.x * rx - entities[i].pos.y * ry) - entities[i].geometry.width / 2,
                    (entities[i].pos.y * rx + entities[i].pos.x * ry) - entities[i].geometry.height / 2,
                    entities[i].geometry.width, entities[i].geometry.height
                );
            }

            this._ctx.restore();
        }

        if(Config.debug){
            for (var i = 0; i < entities.length; i++) {
                this._ctx.save();
                entities[i].drawDebug(this._ctx);
                this._ctx.restore();
            }
        }

        this._ctx.translate(~~-this._camera.view.x, ~~-this._camera.view.y);
    }
}