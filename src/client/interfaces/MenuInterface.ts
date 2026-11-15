import { bunnyTestSetup, singlePlayerGameSetup } from '../../app';
import type { IUI } from './IUI';
import { Config } from '../../config';
import { byId } from '../../lib/dom';

export class MenuInterface implements IUI {

    constructor() {
        const play = byId('play');
        const menu = byId('interface');
        const about = byId('about');
        const option = byId('option');
        const view = byId('game-container');
        const canvas = byId<HTMLCanvasElement>('game');

        // Match the canvas to the container once it has gone fullscreen
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement === view) {
                const { width, height } = view.getBoundingClientRect();
                canvas.width = width;
                canvas.height = height;
            }
        });

        about.addEventListener('click', () => {
            view.requestFullscreen().catch((error) => console.warn('Fullscreen unavailable', error));
        });

        // Hide the menu, then start on the next task so the browser can repaint first
        const startGame = (setup : () => void) => {
            menu.hidden = true;
            setTimeout(setup, 0);
        };

        play.addEventListener('click', () => startGame(singlePlayerGameSetup));
        option.addEventListener('click', () => startGame(bunnyTestSetup));

        if (Config.skipMenu) {
            setTimeout(() => startGame(singlePlayerGameSetup), 100);
        }
    }

    update(dt : number) {
    }

    paint(ctx : CanvasRenderingContext2D) {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }

}
