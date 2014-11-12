class Game {
    loop : GameLoop;
    canvas : Canvas;
    input : InputController;
    //sound : SoundController;
    renderer : Drawer;
    systems : SystemManager;

    map : MapManager;
    camera : Camera;
    level : Level;
    logic : WaveLogic;

    player : Entity;


    constructor () {
        var self = this;
        this.loop = new GameLoop((dt : number) => {
            self.update(dt);
        });

        this.canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
        this.input = new InputController(this.canvas.element);

        this.map = new MapManager(new Vector(), 1500, 1000, this.canvas);
        this.camera = new Camera(this.canvas, this.map);
        this.renderer = new Drawer(this.canvas, this.camera);
        this.systems = new SystemManager(this.renderer);
        this.level = new Level(this.map, this.camera, this.systems);
        this.logic = new WaveLogic(this);
    }

    update (dt : number) {
        this.level.update(dt);
        ui.update(dt);
        ui.draw(this.renderer.getCtx());
        if (Config.debug) {
            ui.drawDebug(this.renderer.getCtx());
        }
    }

    load () {
        var game = this;

        new TaskCollection('Level Setup', function onCompete () {
            ui.loaded(game);
            game.loop.start();
            game.logic.start();
            console.log('GAME OVER MAN!');
        })
            .add(function Controllers() {
                game.input.loadKeyMappings(Config.keyMappings);
            })
            .add(function Map () {
                game.map.loadMap(game.level);
            })
            .add(function LevelEntities () {
                var bulletPool = new Pool<Bullet>(() => {
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
            })
            .addAsync(function LoadingResources (callback) {
                ResourceManager.waitForPendingResources(callback)
            })
            .run();
    }
}