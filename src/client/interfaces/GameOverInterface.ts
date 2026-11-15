import type { IUI } from './IUI';
import { byId } from '../../lib/dom';

export interface GameResult {
    score : number;
    wave? : number;
}

export interface GameOverActions {
    restart() : void;
    mainMenu() : void;
}

export class GameOverInterface implements IUI {
    #container : HTMLElement;
    #screen : HTMLElement;
    #score : HTMLElement;
    #wave : HTMLElement;
    #actions : GameOverActions;

    constructor(actions : GameOverActions) {
        this.#actions = actions;
        this.#container = byId('interface');
        this.#screen = byId('game-over');
        this.#score = byId('game-over-score');
        this.#wave = byId('game-over-wave');

        byId('restart').addEventListener('click', () => this.#restart());
        byId('main-menu').addEventListener('click', () => this.#mainMenu());
        window.addEventListener('keydown', (e : KeyboardEvent) => {
            if (this.isShowing && e.code === 'Enter') {
                this.#restart();
            }
        });
    }

    get isShowing() {
        return !this.#container.hidden && !this.#screen.hidden;
    }

    show(result : GameResult) {
        this.#score.textContent = `Score: ${result.score}`;
        this.#wave.textContent = result.wave === undefined ? '' : `Wave: ${result.wave}`;
        this.#wave.hidden = result.wave === undefined;
        this.#container.hidden = false;
        this.#screen.hidden = false;
    }

    hide() {
        this.#screen.hidden = true;
    }

    #restart() {
        this.hide();
        this.#container.hidden = true;
        this.#actions.restart();
    }

    #mainMenu() {
        this.hide();
        this.#actions.mainMenu();
    }

    update(dt : number) {
    }

    paint(ctx : CanvasRenderingContext2D) {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }
}
