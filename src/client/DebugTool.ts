import type { Game } from './Game';
import type { Entity } from '../core/Entity';

export class DebugTool {
    #game : Game;

    constructor(game : Game) {
        this.#game = game;
    }

    noClip() {
        this.#game.player.getComponent('collision').active = false;
    }

    takeControl(entity : Entity) {
        this.#game.player.getComponent('controller').setEntity(entity);
        entity.getComponent('ai').active = false;
    }
}
