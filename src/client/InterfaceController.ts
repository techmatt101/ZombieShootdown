class InterfaceController implements IUpdate {
    private _paused = false;
    private _overlayElement;
    private _selectedEntity : Entity = null;
    private _game : Game;
    private _lastHealth = 0;

    //private _fps = 0;
    //private _fpsBuffer = [];

    constructor () {
        this._overlayElement = document.getElementById('overlay');
        var play = document.getElementById('play');
        var menu = document.getElementById('interface');
        var about = document.getElementById('about');
        var option = document.getElementById('option');

        about.addEventListener('click', function () {
            function launchIntoFullscreen (element) {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            }

            var view = document.getElementById('game-container');
            launchIntoFullscreen(view);
        });

        function playGame () {
            menu.hidden = true;
            setTimeout(() => {
                gameSetup();
            }, 0);
        }

        function bunnyTest () {
            menu.hidden = true;
            setTimeout(() => {
                bunnyTestSetup();
            }, 0);
        }

        play.addEventListener('click', playGame);
        option.addEventListener('click', bunnyTest);

        if (Config.skipMenu) {
            setTimeout(function () {
                playGame();
            }, 100);
        }
    }

    loaded (game : Game) {
        this._game = game;
        var self = this;

        this._overlayElement.hidden = true;

        window.addEventListener('keyup', (e : KeyboardEvent) => {
            if (e.keyCode === 27) {
                if (self._paused) {
                    self.hide();
                    self._game.loop.start();
                    self._paused = false;
                } else {
                    self.pause();
                    self._game.loop.pause();
                    self._game.sound.pauseAll();
                    self._paused = true;
                }
            }
        });

        this._game.canvas.element.addEventListener('mousedown', (e : MouseEvent) => {
            if (e.ctrlKey) {
                var clickBox = new Box(3, 3, new Vector(e.offsetX + self._game.camera.view.x, e.offsetY + self._game.camera.view.y));
                var length = self._game.level.getEntities().length;
                for (var i = length - 1; i >= 0; i--) {
                    var entity = self._game.level.getEntities()[i];
                    if ((entity.geometry).isBoundingBoxWith(clickBox)) {
                        this._selectedEntity = entity;
                        console.log(entity);
                        return;
                    }
                }
                this._selectedEntity = null;
            }
        });
    }

    update (dt : number) {
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

    draw (ctx : CanvasRenderingContext2D) {
        ctx.font = '20pt visitor';
        ctx.fillStyle = '#fff';
        var lineHeight = 25, line = 1, margin = 20;

        if(this._lastHealth !== this._game.player.components.health.value) {
            ctx.fillStyle = '#f00';
            this._lastHealth = this._game.player.components.health.value;
        }
        ctx.fillText('Health: ' + this._game.player.components.health.value, margin, this._game.canvas.height - lineHeight * line++);

        ctx.fillStyle = '#fff';

        ctx.fillText('Score: ' + game.logic.score, margin, this._game.canvas.height - lineHeight * line++);
        ctx.fillText('Wave: ' + game.logic.wave, margin, this._game.canvas.height - lineHeight * line++);
    }

    resetTextStyle(ctx) {
        ctx.font = '20pt visitor';
        ctx.fillStyle = '#fff';
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
        if (this._selectedEntity !== null) {
            ctx.fillStyle = '#fff';
            ctx.font = '10pt visitor';
            ctx.fillText('ID: ' + this._selectedEntity.id + ' Type: ' + (<any>this._selectedEntity).constructor.name, 5, 10);
            var space = 5;
            var spaceGap = 5;
            var line = 20;
            var lineGap = 10;
            loop(this._selectedEntity);
            function loop (obj) {
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

    pause () {
        this._overlayElement.hidden = false;
        this._overlayElement.innerHTML = 'Paused';
    }

    hide () {
        this._overlayElement.hidden = true;
    }
}