class MenuInterface implements IUI {

    constructor() {
        var play = document.getElementById('play');
        var menu = document.getElementById('interface');
        var about = document.getElementById('about');
        var option = document.getElementById('option');
        var view = document.getElementById('game-container');

        function launchIntoFullScreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }


            setTimeout(function() {
                var g = <any>document.getElementById('game');
                var r = element.getBoundingClientRect();
                g.width = r.width;
                g.height = r.height;
            }, 1000)
        }

        about.addEventListener('click', function() {
            launchIntoFullScreen(view);
        });

        function playSingleGame() {
            menu.hidden = true;
            setTimeout(() => {
                singlePlayerGameSetup();
            }, 0);
        }

        function bunnyTest() {
            menu.hidden = true;
            setTimeout(() => {
                bunnyTestSetup();
            }, 0);
        }

        play.addEventListener('click', playSingleGame);
        option.addEventListener('click', bunnyTest);

        if (Config.skipMenu) {
            setTimeout(function() {
                playSingleGame();
            }, 100);
        }
    }

    update(dt : number) {
    }

    paint(ctx : CanvasRenderingContext2D) {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }

}