import { arcadeGameSetup, bunnyTestSetup, devLevelSetup } from '../../app';
import type { IUI } from './IUI';
import { Config } from '../../config';
import { byId } from '../../lib/dom';

export class MenuInterface implements IUI {

    constructor() {
        const play = byId('play');
        const menu = byId('interface');
        const about = byId('about');
        const option = byId('option');
        const devLevel = byId('dev');
        const view = byId('game-container');
        const canvas = byId<HTMLCanvasElement>('game');

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

        const hideMenuThenStartAfterRepaint = (setup : () => void) => {
            menu.hidden = true;
            setTimeout(setup, 0);
        };

        play.addEventListener('click', () => hideMenuThenStartAfterRepaint(arcadeGameSetup));
        devLevel.addEventListener('click', () => hideMenuThenStartAfterRepaint(devLevelSetup));
        option.addEventListener('click', () => hideMenuThenStartAfterRepaint(bunnyTestSetup));

        const startsInDevLevel = new URLSearchParams(location.search).has('dev');
        if (startsInDevLevel) {
            setTimeout(() => hideMenuThenStartAfterRepaint(devLevelSetup), 100);
        } else if (Config.skipMenu) {
            setTimeout(() => hideMenuThenStartAfterRepaint(arcadeGameSetup), 100);
        }
    }

    update(dt : number) {
    }

    paint(ctx : CanvasRenderingContext2D) {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }
}
