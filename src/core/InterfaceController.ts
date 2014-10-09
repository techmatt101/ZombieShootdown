class InterfaceController {

    paused = false;
    overlayElement = document.getElementById("overlay");
//    fpsCounter = new Box(10, 10 , 50, 20);

    constructor(loop : GameLoop) {
        var self = this;

        window.addEventListener('keyup', (e : KeyboardEvent) => {
            if (e.keyCode === 27) {
                if (self.paused) {
                    self.hide();
                    loop.start();
                    self.paused = false;
                } else {
                    self.pause();
                    loop.pause();
                    self.paused = true;
                }
            }
        });
    }

    loaded() {
        this.overlayElement.hidden = true;
//        var scene = new StaticLayer();
//
//        this.fpsCounter.fps = 0;
//        this.fpsCounter.fpsBuffer = [];
//
//        this.fpsCounter.update = function (time) {
//            if(this.fpsBuffer.length > 15){
//                var sum = 0;
//                for(var i = 0; i < this.fpsBuffer.length; i++){
//                    sum += this.fpsBuffer[i];
//                }
//                this.fps = ~~(sum / this.fpsBuffer.length);
//                this.fpsBuffer = [];
//            }
//            this.fpsBuffer.push(60 / (time * 6));
//        };
//
//        this.fpsCounter.draw = function (ctx) {
//            ctx.fillStyle = "#fff";
//            ctx.fillText(this.fps + " fps", this.x+1, this.y+1);
//            ctx.fillStyle = "#f00";
//            ctx.fillText(this.fps + " fps", this.x, this.y);
//        };
//
//        scene.add(this.fpsCounter);
    }

    pause() {
        this.overlayElement.hidden = false;
        this.overlayElement.innerHTML = 'Paused';
    }

    hide() {
        this.overlayElement.hidden = true;
    }
}