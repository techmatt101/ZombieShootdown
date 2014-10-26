/// <reference path="ref" />
/// <reference path="config" />

var player;

function gameSetup() {
    console.time("Load_Setup");

    var canvas;
    //canvas = new Canvas<WebGLRenderingContext>(<HTMLCanvasElement> document.getElementById('game'));
    canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
    canvas.context = canvas.element.getContext('2d');

    var mg = new MapGenerator();
    mg.generate(new Vector(32, 32), new Vector(canvas.width, canvas.height), 14, 24);

    var map = new MapManager(new Vector(), 1500, 1000, mg);

    var drawer = new Drawer(canvas);
    var loop = new GameLoop();
    var camera = new Camera(canvas, map);
    var level = new Level(drawer, map, camera);

    //Does it belong here?
    var sound = new SoundController();
    var ui = new InterfaceController(loop); //TODO: hmmm...
    var input = new InputController(canvas.element);
    Resources = new ResourceManager();
    input.loadKeyMappings(Config.keyMappings);

    document.getElementById('debug').hidden = true;

    new TaskCollection([
        function loadMap(callback) {
                    callback();

        }
    ],
        function complete() {
            //var bullets = WeaponFactory.spawnBullets(10);
            //var gun = WeaponFactory.spawnGun(bullets);
            player = PlayerFactory.spawnPlayer(mg.getMainRoom(), input, camera, null);
            //player.controller = new PlayerController(player, input, camera);

            //level.addEntities(bullets);
            level.addEntity(player);
            //level.addEntity(gun);
            level.addEntity(EnemyFactory.spawnZombie(mg.getMainRoom(), player));
            level.addEntity(EnemyFactory.spawnZombie(mg.getMainRoom(), player));
            level.addEntity(EnemyFactory.spawnZombie(mg.getMainRoom(), player));
            level.setObjectToFollow(player);

            loop.update = (dt) => {  //TODO: remove hack
                level.update(dt)
            };
            loop.start();

            startGame(ui);
        }
    ).run("Loading Resources");
}


function startGame(ui) {
    ui.loaded();
    console.timeEnd("Load_Setup");
    console.log('GAME OVER MAN!');
}