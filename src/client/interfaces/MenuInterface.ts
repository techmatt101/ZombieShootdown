import type { IUI } from './IUI';
import { Config } from '../../config';
import { byId } from '../../lib/dom';

export interface MenuActions {
    startArcade() : void;
    startDevLevel() : void;
    startBunnyTest() : void;
}

export class MenuInterface implements IUI {
    #container : HTMLElement;
    #welcome : HTMLElement;

    constructor(actions : MenuActions) {
        const play = byId('play');
        const menu = byId('interface');
        this.#container = menu;
        this.#welcome = byId('welcome');
        const about = byId('about');
        const option = byId('option');
        const devLevel = byId('dev');
        const view = byId('game-container');
        const canvases = [byId<HTMLCanvasElement>('game'), byId<HTMLCanvasElement>('hud')];

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement === view) {
                const { width, height } = view.getBoundingClientRect();
                for (let i = 0; i < canvases.length; i++) {
                    canvases[i].width = width;
                    canvases[i].height = height;
                }
            }
        });

        about.addEventListener('click', () => {
            view.requestFullscreen().catch((error) => console.warn('Fullscreen unavailable', error));
        });

        const hideMenuThenStartAfterRepaint = (setup : () => void) => {
            menu.hidden = true;
            setTimeout(setup, 0);
        };

        play.addEventListener('click', () => hideMenuThenStartAfterRepaint(actions.startArcade));
        devLevel.addEventListener('click', () => hideMenuThenStartAfterRepaint(actions.startDevLevel));
        option.addEventListener('click', () => hideMenuThenStartAfterRepaint(actions.startBunnyTest));

        const startsInDevLevel = new URLSearchParams(location.search).has('dev');
        if (startsInDevLevel) {
            setTimeout(() => hideMenuThenStartAfterRepaint(actions.startDevLevel), 100);
        } else if (Config.skipMenu) {
            setTimeout(() => hideMenuThenStartAfterRepaint(actions.startArcade), 100);
        }
    }

    show() {
        this.#container.hidden = false;
        this.#welcome.hidden = false;
    }

    hide() {
        this.#welcome.hidden = true;
    }

    update(dt : number) {
    }

    paint(ctx : CanvasRenderingContext2D) {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }
}
