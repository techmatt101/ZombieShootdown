class Game {
    loop : GameLoop;
    canvas : Canvas;
    input : InputController;
    //sound : SoundController;
    renderer : Drawer;

    map : MapManager;
    camera : Camera;
    level : Level;

    player : Entity;


    constructor () {
        this.canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
        this.input = new InputController(this.canvas.element);
        this.renderer = new Drawer(this.canvas);

        this.map = new MapManager(new Vector(), 1500, 1000, this.canvas);
        this.camera = new Camera(this.canvas, this.map);
        this.level = new Level(this.renderer, this.map, this.camera);

        this.loop = new GameLoop(this.update.bind(this));
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

        new TaskCollection('Level Setup', function () {
            ui.loaded(game);
            game.loop.start();
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
                game.level.addEntities(EnemyFactory.spawnZombies(3, game.map.mapGenerator.getMainRoom(), game.player));
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