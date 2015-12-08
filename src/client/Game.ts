class Game {
    loop : GameLoop;
    canvas : Canvas;
    input : InputHandler;
    inputState : InputState;
    sound : SoundController;
    lighting : LightFilter;
    renderer : CanvasRenderer;
    systems : Systems<Entity>;
    debugSystem : DebugSystem;

    map : MapManager;
    camera : Camera;
    level : TopDownLevel;
    logic : IWaveLogic;

    player : Entity;
    pointer : Entity;

    levelSetupTasks : TaskCollection;


    constructor() {
        var game = this;
        this.loop = new GameLoop((dt : number) => {
            game.update(dt);
        });

        this.canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));

        this.map = new MapManager(new Vector(0, 0), 1300, 1000, this.canvas);
        this.camera = new Camera(this.canvas);
        this.camera.setBoundary(this.map);

        this.sound = new SoundController();
        this.input = new InputHandler(InputAction);

        var mouseAndKeyboardController = new MouseAndKeyboardController(this.canvas.element);
        var mouseAndKeyboardControllerAdaptor = new MouseAndKeyboardAdaptor(mouseAndKeyboardController, this.camera);
        var gamepadController = new GamepadController();
        var gamepadControllerAdaptor = new GamepadAdaptor(gamepadController, this.camera);

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
        if(Config.debug) {
            this.debugSystem = new DebugSystem(this.camera);
            this.systems.schedule(this.debugSystem);
        }
        this.level = new TopDownLevel(this.map, this.camera, this.systems);

        this.levelSetupTasks = new TaskCollection('Level Setup', function onCompete() {
            game.onCompete();
        })
            .add(function Controllers() {
                game.input.load(); //TODO: hmm...
                game.inputState = game.input.getState();

                gamepadController.loadKeyMappings(Config.gamepadKeyMappings);
                mouseAndKeyboardController.loadKeyMappings(Config.mouseKeyMappings);

                ResourceManager.retrieveSound('horror-ambient', (audio : HTMLAudioElement) => {
                    game.sound.load(Sound.AMBIENT, audio);
                    game.sound.play(Sound.AMBIENT);
                });
            })
            .add(function Map() {
                game.map.loadMap(game.level);
            });
    }

    update(dt : number) {
        this.input.update(dt);
        this.systems.update(dt);
        this.camera.update(dt);
        if (Config.lighting) {
            this.lighting.update(dt);
        }
        ui.update(dt);
        this.renderer.paint();

        if(Config.debug) {
            var ctx = this.renderer.getCtx();
            this.debugSystem.paint(ctx);
            this.camera.drawDebug(ctx);
            ui.drawDebug(ctx);
        }

        ui.paint(this.renderer.getCtx());
    }

    onCompete() {
        ui.loaded(this);
        this.loop.start();
    }

    load() {
        this.levelSetupTasks.addAsync(function LoadingResources(callback) {
            ResourceManager.waitForPendingResources(callback)
        }).run();
    }
}