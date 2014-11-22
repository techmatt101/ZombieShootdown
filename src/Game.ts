class Game {
    loop : GameLoop;
    canvas : Canvas;
    input : InputController;
    //sound : SoundController;
    lighting : LightRays;
    renderer : CanvasRender;
    systems : SystemManager;

    map : MapManager;
    camera : Camera;
    level : TopDownLevel;
    logic : WaveLogic;

    player : Entity;


    constructor () {
        var self = this;
        this.loop = new GameLoop((dt : number) => {
            self.update(dt);
        });

        this.canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
        this.input = new InputController(this.canvas.element);

        this.map = new MapManager(new Vector(0, 0), 1300, 1000, this.canvas);
        this.camera = new Camera(this.canvas, this.map);
        if(Config.lighting) {
            this.lighting = new LightRays(this.map);
        }
        this.renderer = new CanvasRender(this.canvas, this.camera, this.lighting);

        this.systems = new SystemManager();
        this.systems.logic = new LogicSystem();
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
            })
            .add(function Map () {
                game.map.loadMap(game.level);
                if(typeof game.lighting !== 'undefined') {
                    game.lighting.loadBlocks(game.level.getEntities());
                }
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