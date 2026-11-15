import './styles/style.css';
import { BunnyTesterGame } from './client/BunnyTesterGame';
import { DebugTool } from './client/DebugTool';
import { InterfaceController } from './client/InterfaceController';
import { SinglePlayerGame } from './client/SinglePlayerGame';
import { Config } from './config';

declare global {
    interface Window {
        game? : SinglePlayerGame | BunnyTesterGame;
        debug? : DebugTool;
    }
}

export let ui! : InterfaceController;

window.addEventListener('load', () => {
    ui = new InterfaceController();
});

export function singlePlayerGameSetup() {
    console.time('GameSetup');
    const game = new SinglePlayerGame();
    console.timeEnd('GameSetup');
    void game.load();

    if (Config.debug) {
        window.game = game;
        window.debug = new DebugTool(game);
    }
}

export function bunnyTestSetup() {
    const game = new BunnyTesterGame();
    game.load();

    if (Config.debug) {
        window.game = game;
    }
}
