class Game {
    loop : GameLoop;
    canvas : Canvas;
    input : InputController;
    sound : SoundController;
    lighting : LightFilter;
    renderer : CanvasRenderer;
    systems : Systems;

    map : MapManager;
    camera : Camera;
    level : TopDownLevel;
    logic : IWaveLogic;

    player : Entity;

    levelSetupTasks : TaskCollection;


    constructor() {
        var game = this;
        this.loop = new GameLoop((dt : number) => {
            game.update(dt);
        });

        this.canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
        this.input = new InputController(this.canvas.element);
        this.sound = new SoundController();

        this.map = new MapManager(new Vector(0, 0), 1300, 1000, this.canvas);
        this.camera = new Camera(this.canvas, this.map);

        // Renderer and Filters
        this.renderer = new CanvasRenderer(this.canvas, this.camera);
        if (Config.lighting) {
            this.lighting = new LightFilter(this.map);
            this.renderer.addFilter(this.lighting);
        }
        this.renderer.addFilter(new PixelFilter());

        // Systems
        this.systems = new Systems();
        this.systems.schedule(new LogicSystem());
        this.systems.schedule(new CollisionSystem());
        this.systems.schedule(new RenderSystem(this.renderer, this.lighting));

        this.level = new TopDownLevel(this.map, this.camera, this.systems);

        this.levelSetupTasks = new TaskCollection('Level Setup', function onCompete() {
            game.onCompete();
        })
            .add(function Controllers() {
                game.input.loadKeyMappings(Config.keyMappings);

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
        this.level.update(dt);

        ui.update(dt);
        ui.draw(this.renderer.getCtx());

        if (Config.debug) {
            var ctx = this.renderer.getCtx();
            if (typeof this.lighting !== 'undefined') {
                this.lighting.drawDebug(ctx);
            }
            ui.drawDebug(ctx);
        }
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