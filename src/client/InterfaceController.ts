import type { Game } from './Game';
import { GameInterface } from './interfaces/GameInterface';
import type { IUI } from './interfaces/IUI';
import { MenuInterface } from './interfaces/MenuInterface';
import type { IUpdate } from '../lib/IUpdate';

export class InterfaceController implements IUpdate {
    #ui : IUI;


    constructor() {
        this.#ui = new MenuInterface();
    }

    loaded(game : Game) {
        this.#ui = new GameInterface(game);
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
