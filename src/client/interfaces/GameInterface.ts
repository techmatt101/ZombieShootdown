class GameInterface implements IUI {
    private _game : Game;
    private _paused = false;
    private _lastHealth = 0;
    private _overlayElement;
    private _selectedEntity : Entity = null;

    //private _fps = 0;
    //private _fpsBuffer = [];


    constructor(game : Game) {
        this._game = game;
        this._overlayElement = document.getElementById('overlay');
        this._overlayElement.hidden = true;

        window.addEventListener('keyup', (e : KeyboardEvent) => {
            if (e.keyCode === 27) {
                if (this._paused) {
                    this.hide();
                    this._game.loop.start();
                    this._paused = false;
                } else {
                    this.pause();
                    this._game.loop.pause();
                    this._game.sound.pauseAll();
                    this._paused = true;
                }
            }
        });

        this._game.canvas.element.addEventListener('mousedown', (e : MouseEvent) => {
            if (e.ctrlKey) {
                var length = this._game.level.getEntities().length;
                for (var i = length - 1; i >= 0; i--) {
                    var entity = this._game.level.getEntities()[i];
                    if ((entity.geometry).isBoundingBoxWith(this._game.pointer.geometry)) {
                        this._selectedEntity = entity;
                        console.log(entity);
                        return;
                    }
                }
                this._selectedEntity = null;
            }
        });
    }

    pause() {
        this._overlayElement.hidden = false;
        this._overlayElement.innerHTML = 'Paused';
    }

    hide() {
        this._overlayElement.hidden = true;
    }

    update(dt : number) {
        if(this._game.inputState.isKeyDown(InputAction.ZOOM_IN)) {
            this._game.camera.zoom += 0.1 * dt;
        }

        if(this._game.inputState.isKeyDown(InputAction.ZOOM_OUT)) {
            this._game.camera.zoom -= 0.1 * dt;
        }

//            if(this.fpsBuffer.length > 15){
//                var sum = 0;
//                for(var i = 0; i < this.fpsBuffer.length; i++){
//                    sum += this.fpsBuffer[i];
//                }
//                this.fps = ~~(sum / this.fpsBuffer.length);
//                this.fpsBuffer = [];
//            }
//            this.fpsBuffer.push(60 / (time * 6));
    }

    paint(ctx : CanvasRenderingContext2D) {
        ctx.font = '20pt visitor';
        ctx.fillStyle = '#fff';

        var lineHeight = 25, line = 1, margin = 20;

        if (this._lastHealth !== this._game.player.components.health.value) {
            ctx.fillStyle = '#f00';
            this._lastHealth = this._game.player.components.health.value;
        }
        ctx.fillText('Health: ' + this._game.player.components.health.value, margin, this._game.canvas.height - lineHeight * line++);

        ctx.fillStyle = '#fff';

        ctx.fillText('Score: ' + game.logic.score, margin, this._game.canvas.height - lineHeight * line++);
        ctx.fillText('Wave: ' + game.logic.wave, margin, this._game.canvas.height - lineHeight * line++);
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        if (this._selectedEntity !== null) {
            ctx.fillStyle = '#fff';
            ctx.font = '10pt visitor';
            ctx.fillText('ID: ' + this._selectedEntity.id + ' Type: ' + this._selectedEntity.type + ' Instance: ' + (<any>this._selectedEntity).constructor.name, 5, 10);
            var space = 5;
            var spaceGap = 5;
            var line = 20;
            var lineGap = 10;
            loop(this._selectedEntity);
            function loop(obj) {
                for (var key in obj) {
                    if (key[0] !== '_' && typeof obj[key] !== 'function' && !(obj[key] instanceof Image)) {
                        if (typeof obj[key] === 'object') {
                            ctx.fillText(key + ':', space, line);
                            line += lineGap;
                            space += spaceGap;
                            loop(obj[key]);
                            space -= spaceGap;
                        } else {
                            ctx.fillText(key + ': ' + obj[key], space, line);
                            line += lineGap;
                        }
                    }
                }
            }
        }
//            ctx.fillStyle = "#fff";
//            ctx.fillText(this.fps + " fps", this.x+1, this.y+1);
//            ctx.fillStyle = "#f00";
//            ctx.fillText(this.fps + " fps", this.x, this.y);
    }

}