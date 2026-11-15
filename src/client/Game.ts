import { ui } from '../app';
import type { IWaveLogic } from './logic/IWaveLogic';
import { Config } from '../config';
import { Entity } from '../core/Entity';
import { MapManager } from '../core/level/MapManager';
import { TopDownLevel } from '../core/level/TopDownLevel';
import { CanvasRenderer } from '../core/render/CanvasRenderer';
import { LightFilter } from '../core/render/filters/LightFilter';
import { PixelFilter } from '../core/render/filters/PixelFilter';
import { Systems } from '../core/Systems';
import { CollisionSystem } from '../core/systems/CollisionSystem';
import { DebugSystem } from '../core/systems/DebugSystem';
import { LogicSystem } from '../core/systems/LogicSystem';
import { RenderSystem } from '../core/systems/RenderSystem';
import { Camera } from '../lib/Camera';
import { Canvas } from '../lib/Canvas';
import { GamepadAdaptor } from '../lib/controllers/GamepadAdaptor';
import { GamepadController } from '../lib/controllers/GamepadController';
import { InputHandler } from '../lib/controllers/InputHandler';
import { InputState } from '../lib/controllers/InputState';
import { MouseAndKeyboardAdaptor } from '../lib/controllers/MouseAndKeyboardAdaptor';
import { MouseAndKeyboardController } from '../lib/controllers/MouseAndKeyboardController';
import { Sound, SoundController } from '../lib/controllers/SoundController';
import { GameLoop } from '../lib/GameLoop';
import { Vector } from '../lib/geometry/Vector';
import { byId } from '../lib/dom';
import { loadSound, whenAssetsLoaded } from '../lib/assets';
import { TaskCollection } from '../lib/TaskCollection';

export abstract class Game {
    loop : GameLoop;
    canvas : Canvas;
    input : InputHandler;
    inputState : InputState;
    sound : SoundController;
    lighting? : LightFilter;
    renderer : CanvasRenderer;
    systems : Systems<Entity>;
    debugSystem? : DebugSystem;

    map : MapManager;
    camera : Camera;
    level : TopDownLevel;
    abstract logic : IWaveLogic;

    // Spawned by the level setup tasks, before the game loop starts.
    player! : Entity;
    pointer! : Entity;

    levelSetupTasks : TaskCollection;


    constructor() {
        this.loop = new GameLoop((dt) => this.update(dt));

        this.canvas = new Canvas(byId<HTMLCanvasElement>('game'));

        this.map = new MapManager(new Vector(0, 0), 1300, 1000, this.canvas);
        this.camera = new Camera(this.canvas);
        this.camera.setBoundary(this.map);

        this.sound = new SoundController();
        this.input = new InputHandler();
        this.inputState = this.input.getState();

        const mouseAndKeyboardController = new MouseAndKeyboardController(this.canvas.element);
        const mouseAndKeyboardControllerAdaptor = new MouseAndKeyboardAdaptor(mouseAndKeyboardController, this.camera);
        const gamepadController = new GamepadController();
        const gamepadControllerAdaptor = new GamepadAdaptor(gamepadController, this.camera);

        this.input.loadController(gamepadControllerAdaptor);
        this.input.loadController(mouseAndKeyboardControllerAdaptor);

        // Renderer and Filters
        this.renderer = new CanvasRenderer(this.canvas, this.camera);
        if (Config.lighting) {
            this.lighting = new LightFilter(this.map);
            this.renderer.addFilter(this.lighting);
        }
        this.renderer.addFilter(new PixelFilter());

        // Systems
        this.systems = new Systems<Entity>();
        this.systems.schedule(new LogicSystem());
        this.systems.schedule(new CollisionSystem());
        this.systems.schedule(new RenderSystem(this.renderer));
        if (Config.debug) {
            this.debugSystem = new DebugSystem(this.camera);
            this.systems.schedule(this.debugSystem);
        }
        this.level = new TopDownLevel(this.map, this.camera, this.systems);

        this.levelSetupTasks = new TaskCollection('Level Setup')
            .add('Controllers', () => {
                this.input.load(); //TODO: hmm...

                gamepadController.loadKeyMappings(Config.gamepadKeyMappings);
                mouseAndKeyboardController.loadKeyMappings(Config.keyMappings);

                void loadSound('horror-ambient').then((audio) => {
                    this.sound.load(Sound.AMBIENT, audio);
                    this.sound.play(Sound.AMBIENT);
                });
            })
            .add('Map', () => {
                this.map.loadMap(this.level);
            });
    }

    update(dt : number) {
        this.input.update(dt);
        this.systems.update(dt);
        this.camera.update(dt);
        this.lighting?.update(dt);
        ui.update(dt);
        this.renderer.paint();

        if (Config.debug) {
            const ctx = this.renderer.getCtx();
            this.debugSystem?.paint(ctx);
            this.camera.drawDebug(ctx);
            ui.drawDebug(ctx);
        }

        ui.paint(this.renderer.getCtx());
    }

    onLoaded() {
        ui.loaded(this);
        this.loop.start();
    }

    async load() {
        await this.levelSetupTasks
            .add('Loading Resources', whenAssetsLoaded)
            .run();
        this.onLoaded();
    }
}
