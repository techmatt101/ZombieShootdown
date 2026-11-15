import { bunnyTestSetup, singlePlayerGameSetup } from '../../app';
import type { IUI } from './IUI';
import { Config } from '../../config';
import { byId } from '../../lib/dom';

export class MenuInterface implements IUI {

    constructor() {
        var play = byId('play');
        var menu = byId('interface');
        var about = byId('about');
        var option = byId('option');
        var view = byId('game-container');

        function launchIntoFullScreen(element : HTMLElement) {
            element.requestFullscreen();

            setTimeout(function() {
                var g = byId<HTMLCanvasElement>('game');
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
