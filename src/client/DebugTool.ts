module ZombieApp {
    export class DebugTool {
        private _game : Game;

        constructor(game : Game) {
            this._game = game;
        }

        noClip() {
            this._game.player.components.collision.active = false;
        }

        takeControl(entity : Entity) {
            this._game.player.components.controller._entity = entity;
            entity.components.ai.active = false;
        }
    }
}