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


    constructor() {
        this.canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
        this.input = new InputController(this.canvas.element);
        this.renderer = new Drawer(this.canvas);

        this.map = new MapManager(new Vector(), 1500, 1000, this.canvas);
        this.camera = new Camera(this.canvas, this.map);
        this.level = new Level(this.renderer, this.map, this.camera);

        this.loop = new GameLoop(this.update.bind(this));
    }

    update(dt : number) {
        this.level.update(dt);
        ui.update(dt);
        ui.draw(this.renderer.getCTX());
        if(Config.debug) {
            ui.drawDebug(this.renderer.getCTX()); //TODO: hmm...
        }
    }

    load () {
        console.time("Load_Setup");
        var self = this;

        this.input.loadKeyMappings(Config.keyMappings);
        this.map.loadMap(this.level);

        var bulletPool = new Pool<Bullet>(() => {
            var bullet = WeaponFactory.spawnBullet();
            self.level.addEntity(bullet);
            return bullet;
        });

        var gun = WeaponFactory.spawnGun(bulletPool);
        this.player = PlayerFactory.spawnPlayer(this.map.mapGenerator.getMainRoom(), this.input, this.camera, gun);

        this.level.addEntity(this.player);
        this.level.addEntity(gun);
        this.level.addEntities(EnemyFactory.spawnZombies(3, this.map.mapGenerator.getMainRoom(), this.player));
        this.level.setObjectToFollow(this.player);


        ui.loaded(this);
        this.loop.start();

        console.timeEnd("Load_Setup");
        console.log('GAME OVER MAN!');

        //var resources = new ResourceManager();
        //new TaskCollection([
        //        function loadMap(callback) {
        //            callback();
        //
        //        }
        //    ],
        //    function complete() {
        //
        //    }
        //).run("Loading Resources");
    }
}