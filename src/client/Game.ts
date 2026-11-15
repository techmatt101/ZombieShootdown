import { ui } from '../app';
import { GameLogicEvent, type IGameLogic } from './logic/IGameLogic';
import { Config } from '../config';
import type { Entity } from '../core/Entity';
import { TopDownLevel } from '../core/level/TopDownLevel';
import { createGpuContext } from '../core/render/gpu/GpuContext';
import { GpuRenderer } from '../core/render/GpuRenderer';
import { Systems } from '../core/Systems';
import { DoorSpawner } from '../core/level/DoorSpawner';
import { CollisionSystem } from '../core/systems/CollisionSystem';
import { InteractionSystem } from '../core/systems/InteractionSystem';
import { LightingSystem } from '../core/systems/LightingSystem';
import { LightField } from '../lighting/LightField';
import { MapMemory } from '../lighting/MapMemory';
import { DebugSystem } from '../core/systems/DebugSystem';
import { LogicSystem } from '../core/systems/LogicSystem';
import { RenderSystem } from '../core/systems/RenderSystem';
import { Camera } from '../lib/Camera';
import { Canvas, HudCanvas } from '../lib/Canvas';
import { GamepadAdaptor } from '../lib/controllers/GamepadAdaptor';
import { GamepadController } from '../lib/controllers/GamepadController';
import { InputHandler } from '../lib/controllers/InputHandler';
import type { InputState } from '../lib/controllers/InputState';
import { MouseAndKeyboardAdaptor } from '../lib/controllers/MouseAndKeyboardAdaptor';
import { MouseAndKeyboardController } from '../lib/controllers/MouseAndKeyboardController';
import { Sound, SoundController } from '../lib/controllers/SoundController';
import { GameLoop } from '../lib/GameLoop';
import { byId } from '../lib/dom';
import { PerfStats } from '../lib/PerfStats';
import { PerfOverlay } from './PerfOverlay';
import { loadImage, loadSound, whenAssetsLoaded } from '../lib/assets';
import { CHUNK_SIZE } from '../world/constants';
import { ChunkStreamer } from '../world/ChunkStreamer';
import { TileMap } from '../world/TileMap';
import { WorldLayer } from '../world/WorldLayer';
import { TaskCollection } from '../lib/TaskCollection';

export abstract class Game {
    loop : GameLoop;
    canvas : Canvas;
    hud : HudCanvas;
    input : InputHandler;
    inputState : InputState;
    sound : SoundController;
    lighting? : LightField;
    renderer : GpuRenderer;
    systems : Systems<Entity>;
    debugSystem? : DebugSystem;

    chunks : ChunkStreamer;
    tileMap : TileMap;
    camera : Camera;
    level : TopDownLevel;
    collisionSystem : CollisionSystem;
    abstract logic : IGameLogic;

    player! : Entity;
    pointer! : Entity;

    levelSetupTasks : TaskCollection;
    perf = new PerfStats();
    #lifetime = new AbortController();
    #perfOverlay = new PerfOverlay(this.perf);


    constructor(seed : number) {
        this.loop = new GameLoop((dt) => this.update(dt));

        this.canvas = new Canvas(byId<HTMLCanvasElement>('game'));
        this.hud = new HudCanvas(byId<HTMLCanvasElement>('hud'));

        this.chunks = new ChunkStreamer(seed);
        this.tileMap = new TileMap(this.chunks);
        this.camera = new Camera(this.canvas.center);

        this.sound = new SoundController(Config.sound);
        this.input = new InputHandler(this.signal);
        this.inputState = this.input.getState();

        const mouseAndKeyboardController = new MouseAndKeyboardController(this.canvas.element, this.signal);
        const mouseAndKeyboardControllerAdaptor = new MouseAndKeyboardAdaptor(mouseAndKeyboardController, this.camera);
        const gamepadController = new GamepadController();
        const gamepadControllerAdaptor = new GamepadAdaptor(gamepadController, this.camera);

        this.input.loadController(gamepadControllerAdaptor);
        this.input.loadController(mouseAndKeyboardControllerAdaptor);

        this.renderer = new GpuRenderer(this.camera);
        this.renderer.setBackground(new WorldLayer(this.chunks, this.camera, this.renderer));
        if (Config.lighting) {
            this.lighting = new LightField(this.tileMap, new MapMemory(this.chunks));
            this.renderer.setLighting(this.lighting);
        }

        this.systems = new Systems<Entity>();
        this.systems.schedule(new LogicSystem());
        if (this.lighting !== undefined) {
            this.systems.schedule(new LightingSystem(this.lighting));
        }
        this.collisionSystem = new CollisionSystem(this.tileMap);
        this.systems.schedule(this.collisionSystem);
        this.systems.schedule(new InteractionSystem());
        this.systems.schedule(new RenderSystem(this.renderer));
        if (Config.debug) {
            this.debugSystem = new DebugSystem(this.camera);
            this.systems.schedule(this.debugSystem);
        }
        this.level = new TopDownLevel(this.chunks, this.tileMap, this.camera, this.systems);
        const doorSpawner = new DoorSpawner(this.level);

        this.levelSetupTasks = new TaskCollection('Level Setup')
            .add('Renderer', async () => {
                await this.renderer.init(await createGpuContext(this.canvas.element));
            })
            .add('Controllers', () => {
                this.input.load();

                gamepadController.loadKeyMappings(Config.gamepadKeyMappings);
                mouseAndKeyboardController.loadKeyMappings(Config.keyMappings);

                void loadSound('horror-ambient').then((audio) => {
                    audio.loop = true;
                    this.sound.load(Sound.AMBIENT, audio);
                    this.sound.play(Sound.AMBIENT);
                });
            })
            .add('World', async () => {
                const tileAtlas = await loadImage('tiles');
                doorSpawner.useAtlas(tileAtlas);
                await this.chunks.start(tileAtlas);
                const spawnChunkCentre = { x: CHUNK_SIZE / 2, y: CHUNK_SIZE / 2 };
                await this.chunks.whenLoadedAround(spawnChunkCentre, this.camera.screenCentre.x, this.camera.screenCentre.y);
            });
    }

    update(dt : number) {
        this.perf.frame();

        this.perf.begin('update');
        this.#streamWorld();
        this.input.update(dt);
        this.systems.update(dt);
        this.camera.update(dt);
        ui.update(dt);
        this.perf.end('update');

        this.perf.begin('lighting');
        this.lighting?.update(dt);
        this.perf.end('lighting');

        this.perf.begin('render');
        this.renderer.paint();
        this.perf.end('render');

        const ctx = this.hud.context;
        this.hud.beginFrame();
        if (Config.debug) {
            this.debugSystem?.paint(ctx);
            this.camera.drawDebug(ctx);
            ui.drawDebug(ctx);
        }

        ui.paint(ctx);

        if (Config.debug) {
            this.perf.count('entities', this.#countActiveEntities());
            this.perf.count('chunks', this.chunks.loadedCount);
            this.perf.count('chunks pending', this.chunks.pendingCount);
            this.perf.count('collision pairs', this.collisionSystem.pairsTested);
            this.perf.count('draw calls', this.renderer.drawCalls);
            this.#perfOverlay.paint(ctx);
        }
    }

    #countActiveEntities() {
        const entities = this.level.getEntities();
        let activeCount = 0;
        for (let i = 0; i < entities.length; i++) {
            if (entities[i].active) {
                activeCount++;
            }
        }
        return activeCount;
    }

    #streamWorld() {
        const focus = this.camera.target ?? this.camera.pos;
        this.chunks.update(focus, this.camera.halfView.x, this.camera.halfView.y);
    }

    get signal() {
        return this.#lifetime.signal;
    }

    onLoaded() {
        ui.loaded(this);
        this.logic.on(GameLogicEvent.OVER, () => this.end());
        this.loop.start();
    }

    end() {
        this.loop.pause();
        this.#lifetime.abort();
        this.sound.pauseAll();
        document.exitPointerLock?.();
        ui.gameOver({ score: this.logic.score, wave: this.logic.wave });
    }

    dispose() {
        this.loop.pause();
        this.#lifetime.abort();
        this.sound.stopAll();
        this.chunks.stop();
        this.renderer.dispose();
    }

    async load() {
        await this.levelSetupTasks
            .add('Loading Resources', whenAssetsLoaded)
            .run();
        this.onLoaded();
    }
}
