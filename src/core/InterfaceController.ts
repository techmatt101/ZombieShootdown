class InterfaceController implements IUpdate {
    paused = false;
    overlayElement;
    selectedEntity : Entity = null;
    game : Game;
//    fpsCounter = new Box(10, 10 , 50, 20);
    //        this.fpsCounter.fps = 0;
//        this.fpsCounter.fpsBuffer = [];

    constructor () {
        this.overlayElement = document.getElementById('overlay');
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
        this.game = game;
        var self = this;

        this.overlayElement.hidden = true;

        window.addEventListener('keyup', (e : KeyboardEvent) => {
            if (e.keyCode === 27) {
                if (self.paused) {
                    self.hide();
                    self.game.loop.start();
                    self.paused = false;
                } else {
                    self.pause();
                    self.game.loop.pause();
                    self.paused = true;
                }
            }
        });

        this.game.canvas.element.addEventListener('mousedown', (e : MouseEvent) => {
            if(e.ctrlKey) {
                var clickBox = new Box(3,3, new Vector(e.offsetX + self.game.camera.view.x, e.offsetY + self.game.camera.view.y));
                var length = self.game.level.getEntities().length;
                for (var i = length - 1; i >= 0; i--) {
                    var entity = self.game.level.getEntities()[i];
                    if((entity.geometry).isBoundingBoxWith(clickBox)) {
                        this.selectedEntity = entity;
                        console.log(entity);
                        return;
                    }
                }
                this.selectedEntity = null;
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
        ctx.font = '20pt Calibri';
        ctx.fillText('Wave: ' + game.logic.wave, 5, this.game.canvas.height - 50);
        ctx.fillText('Health: ' + this.game.player.components.health.value, 5, this.game.canvas.height - 30);
        ctx.fillText('Score: ' + game.logic.score, 5, this.game.canvas.height - 10);
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
        if (this.selectedEntity !== null) {
            ctx.fillStyle = '#fff';
            ctx.fillText('ID: ' + this.selectedEntity.id + ' Type: ' + (<any>this.selectedEntity).constructor.name, 5, 10);
            var space = 5;
            var spaceGap = 5;
            var line = 20;
            var lineGap = 10;
            loop(this.selectedEntity);
            function loop(obj) {
                for(var key in obj) {
                    if (key[0] !== '_' && typeof obj[key] !== 'function' && !(obj[key] instanceof Image)) {
                        if(typeof obj[key] === 'object') {
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
        this.overlayElement.hidden = false;
        this.overlayElement.innerHTML = 'Paused';
    }

    hide () {
        this.overlayElement.hidden = true;
    }
}