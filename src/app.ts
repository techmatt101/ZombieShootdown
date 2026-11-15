import './styles/style.css';
import { BunnyTesterGame } from './client/BunnyTesterGame';
import { DebugTool } from './client/DebugTool';
import { InterfaceController } from './client/InterfaceController';
import { SinglePlayerGame } from './client/SinglePlayerGame';
import { Config } from './config';

export var ui : InterfaceController = null;
export var game : any = null;
export var debug : DebugTool = null;

window.addEventListener('load',() => {
    ui = new InterfaceController();
});

export function singlePlayerGameSetup () {
    console.time("GameSetup");
    game = new SinglePlayerGame();
    console.timeEnd("GameSetup");
    game.load();

    if(Config.debug) {
        debug = new DebugTool(game);
    }
}

export function bunnyTestSetup() {
    game = new BunnyTesterGame();
    game.load();
}
