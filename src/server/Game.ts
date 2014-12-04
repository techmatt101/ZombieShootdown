class Game {
    systems : SystemManager;
    map : MapManager;
    level : TopDownLevel;
    logic : WaveLogic;

    players : Entity[];


    constructor () {
        var self = this;
        this.canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
        this.input = new InputController(this.canvas.element);
        this.sound = new SoundController();

        this.map = new MapManager(new Vector(0, 0), 1300, 1000, this.canvas);
        this.camera = new Camera(this.canvas, this.map);

        // Renderer and Filters
        this.renderer = new CanvasRenderer(this.canvas, this.camera);
        if(Config.lighting) {
            this.lighting = new LightFilter(this.map);
            this.renderer.addFilter(this.lighting);
        }
        this.renderer.addFilter(new PixelFilter());

        // Systems
        this.systems = new SystemManager();
        this.systems.logic = new LogicSystem();
        this.systems.ai = new AISystem(this.map);
        this.systems.collision = new CollisionSystem();
        this.systems.render = new RenderSystem(this.renderer, this.lighting);

        this.level = new TopDownLevel(this.map, this.camera, this.systems);
        this.logic = new WaveLogic(this.level);
    }

    update (dt : number) {
        this.level.update(dt);

        ui.update(dt);
        ui.draw(this.renderer.getCtx());

        if (Config.debug) {
            var ctx = this.renderer.getCtx();
            if(typeof this.lighting !== 'undefined') {
                this.lighting.drawDebug(ctx);
            }
            ui.drawDebug(ctx);
        }
    }

    load () {
        var game = this;

        new TaskCollection('Level Setup', function onCompete () {
            ui.loaded(game);
            game.loop.start();
            game.logic.start(game.player);
            console.log('GAME OVER MAN!');
        })
            .add(function Controllers() {
                game.input.loadKeyMappings(Config.keyMappings);

                ResourceManager.retrieveSound('horror-ambient', (audio : HTMLAudioElement) => {
                    game.sound.load(Sound.AMBIENT, audio);
                    game.sound.play(Sound.AMBIENT);
                });
            })
            .add(function Map () {
                game.map.loadMap(game.level);
            })
            .add(function LevelEntities () {
                var bulletPool = new Pool<Entity>(() => {
                    var bullet = WeaponFactory.spawnBullet();
                    game.level.addEntity(bullet);
                    return bullet;
                });

                var gun = WeaponFactory.spawnGun(bulletPool);
                game.player = PlayerFactory.spawnPlayer(game.map.mapGenerator.getMainRoom(), game.input, game.camera, gun);

                game.level.addEntity(game.player);
                game.level.addEntity(gun);
            })
            .add(function LevelTweaks () {
                game.level.setObjectToFollow(game.player);
                if(typeof game.lighting !== 'undefined') {
                    game.lighting.setLightSource(game.player.pos);
                }
            })
            .addAsync(function LoadingResources (callback) {
                ResourceManager.waitForPendingResources(callback)
            })
            .run();
    }
}