import type { Game } from './Game';
import { GameInterface } from './interfaces/GameInterface';
import { GameOverInterface, type GameOverActions, type GameResult } from './interfaces/GameOverInterface';
import type { IUI } from './interfaces/IUI';
import { MenuInterface, type MenuActions } from './interfaces/MenuInterface';
import type { IUpdate } from '../lib/IUpdate';

export class InterfaceController implements IUpdate {
    #menu : MenuInterface;
    #gameOver : GameOverInterface;
    #ui : IUI;


    constructor(actions : MenuActions & GameOverActions) {
        this.#menu = new MenuInterface(actions);
        this.#gameOver = new GameOverInterface(actions);
        this.#ui = this.#menu;
    }

    loaded(game : Game) {
        this.#ui = new GameInterface(game);
    }

    gameOver(result : GameResult) {
        this.#menu.hide();
        this.#gameOver.show(result);
        this.#ui = this.#gameOver;
    }

    showMenu() {
        this.#gameOver.hide();
        this.#menu.show();
        this.#ui = this.#menu;
    }

    update(dt : number) {
        this.#ui.update(dt);
    }

    paint(ctx : CanvasRenderingContext2D) {
        this.#ui.paint(ctx);
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        this.#ui.drawDebug(ctx);
    }
}
