import './styles/style.css';
import { BunnyTesterGame } from './client/BunnyTesterGame';
import { DebugTool } from './client/DebugTool';
import { InterfaceController } from './client/InterfaceController';
import { AmbientZombieLogic } from './client/logic/AmbientZombieLogic';
import { SinglePlayerWaveLogic } from './client/logic/SinglePlayerWaveLogic';
import { SinglePlayerGame, type LogicFactory } from './client/SinglePlayerGame';
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

function worldSeed() {
    const seedParam = new URLSearchParams(location.search).get('seed');
    return seedParam === null ? Math.floor(Math.random() * 2 ** 32) : Number(seedParam) >>> 0;
}

function startSinglePlayerGame(createLogic : LogicFactory) {
    console.time('GameSetup');
    const game = new SinglePlayerGame(worldSeed(), createLogic);
    console.timeEnd('GameSetup');
    void game.load();

    if (Config.debug) {
        window.game = game;
        window.debug = new DebugTool(game);
    }
}

export function arcadeGameSetup() {
    startSinglePlayerGame((level) => new SinglePlayerWaveLogic(level));
}

export function devLevelSetup() {
    startSinglePlayerGame((level) => new AmbientZombieLogic(level));
}

export function bunnyTestSetup() {
    const game = new BunnyTesterGame();
    game.load();

    if (Config.debug) {
        window.game = game;
    }
}
