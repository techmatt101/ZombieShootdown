/// <reference path="ref" />
/// <reference path="config" />

var player;
var ui : InterfaceController;

window.onload = () => {
    ui = new InterfaceController();
};

function gameSetup() {
    console.time("Load_Setup");

    var canvas;
    //canvas = new Canvas<WebGLRenderingContext>(<HTMLCanvasElement> document.getElementById('game'));
    canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
    canvas.context = canvas.element.getContext('2d');

    // disable pixel smoothing
    canvas.context.imageSmoothingEnabled = false;
    //canvas.context.mozImageSmoothingEnabled = false;
    //canvas.context.oImageSmoothingEnabled = false;
    //canvas.context.webkitImageSmoothingEnabled = false;

    var mg = new MapGenerator();
    mg.generate(new Vector(32, 32), new Vector(canvas.width, canvas.height), 14, 24);

    var map = new MapManager(new Vector(), 1500, 1000, mg);

    var drawer = new Drawer(canvas);
    var loop = new GameLoop();
    var camera = new Camera(canvas, map);
    var level = new Level(drawer, map, camera);

    //Does it belong here?
    var sound = new SoundController();
    var input = new InputController(canvas.element);
    Resources = new ResourceManager();
    input.loadKeyMappings(Config.keyMappings);

    new TaskCollection([
        function loadMap(callback) {
                    callback();

        }
    ],
        function complete() {
            var bullets = WeaponFactory.spawnBullets(10);
            var gun = WeaponFactory.spawnGun(bullets);
            player = PlayerFactory.spawnPlayer(mg.getMainRoom(), input, camera, gun);
            //player.controller = new PlayerController(player, input, camera);

            level.addEntities(bullets);
            level.addEntity(player);
            level.addEntity(gun);
            level.addEntities(EnemyFactory.spawnZombies(3, mg.getMainRoom(), player));
            level.setObjectToFollow(player);

            loop.update = (dt) => {  //TODO: remove hack
                level.update(dt)
            };
            loop.start();

            startGame(ui, loop);
        }
    ).run("Loading Resources");
}


function startGame(ui, loop) {
    ui.loaded(loop);
    console.timeEnd("Load_Setup");
    console.log('GAME OVER MAN!');
}