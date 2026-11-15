import './styles/style.css';
import { BunnyTesterGame } from './client/BunnyTesterGame';
import { DebugTool } from './client/DebugTool';
import { InterfaceController } from './client/InterfaceController';
import { AmbientZombieLogic } from './client/logic/AmbientZombieLogic';
import { SinglePlayerWaveLogic } from './client/logic/SinglePlayerWaveLogic';
import { SinglePlayerGame, type LogicFactory } from './client/SinglePlayerGame';
import { Config } from './config';
import { byId } from './lib/dom';

declare global {
    interface Window {
        game? : SinglePlayerGame | BunnyTesterGame;
        debug? : DebugTool;
    }
}

export let ui! : InterfaceController;

let currentGame : SinglePlayerGame | BunnyTesterGame | null = null;
let restartCurrentGame : (() => void) | null = null;

window.addEventListener('load', () => {
    ui = new InterfaceController({
        startArcade: arcadeGameSetup,
        startDevLevel: devLevelSetup,
        startBunnyTest: bunnyTestSetup,
        restart: restartGame,
        mainMenu: returnToMenu,
    });
});

function worldSeed() {
    const seedParam = new URLSearchParams(location.search).get('seed');
    return seedParam === null ? Math.floor(Math.random() * 2 ** 32) : Number(seedParam) >>> 0;
}

function replaceCurrentGame(game : SinglePlayerGame | BunnyTesterGame | null) {
    currentGame?.dispose();
    currentGame = game;
    if (Config.debug) {
        window.game = game ?? undefined;
        window.debug = game instanceof SinglePlayerGame ? new DebugTool(game) : undefined;
    }
}

function startSinglePlayerGame(createLogic : LogicFactory) {
    const overlay = byId('overlay');
    overlay.textContent = 'Loading...';
    overlay.hidden = false;
    const game = new SinglePlayerGame(worldSeed(), createLogic);
    replaceCurrentGame(game);
    restartCurrentGame = () => startSinglePlayerGame(createLogic);
    game.load().catch((error : unknown) => showLoadFailure(overlay, error));
}

function showLoadFailure(overlay : HTMLElement, error : unknown) {
    overlay.textContent = error instanceof Error ? error.message : String(error);
    overlay.hidden = false;
    console.error(error);
}

function arcadeGameSetup() {
    startSinglePlayerGame((level) => new SinglePlayerWaveLogic(level));
}

function devLevelSetup() {
    startSinglePlayerGame((level) => new AmbientZombieLogic(level));
}

function bunnyTestSetup() {
    const game = new BunnyTesterGame();
    replaceCurrentGame(game);
    restartCurrentGame = bunnyTestSetup;
    game.load().catch((error : unknown) => showLoadFailure(byId('overlay'), error));
}

function restartGame() {
    restartCurrentGame?.();
}

function returnToMenu() {
    replaceCurrentGame(null);
    restartCurrentGame = null;
    ui.showMenu();
}
