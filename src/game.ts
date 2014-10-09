/// <reference path="config.ts" />
/// <reference path="lib/controllers/SoundController.ts" />
/// <reference path="lib/controllers/InputController.ts" />
/// <reference path="lib/Canvas.ts" />
/// <reference path="lib/GameLoop.ts" />
/// <reference path="core/Level.ts" />
/// <reference path="core/Drawer.ts" />
/// <reference path="core/InterfaceController.ts" />
/// <reference path="core/level/MapManager.ts" />
/// <reference path="core/gameobjects/character/Player.ts" />
/// <reference path="core/gameobjects/character/Zombie.ts" />
/// <reference path="lib/ResourceManager.ts" />
/// <reference path="lib/TaskCollection.ts" />
/// <reference path="core/tilemap/MapGenerator.ts" />

var tileSize = 32;
function gameSetup() {
    console.time("Load_Setup");

    var canvas;
    //canvas = new Canvas<WebGLRenderingContext>(<HTMLCanvasElement> document.getElementById('game'));
    canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
    canvas.context = canvas.element.getContext('2d');

    var mg = new MapGenerator();
    mg.generate(new Vector(canvas.width / tileSize, canvas.height / tileSize), 14, 24);

    var map = new MapManager(new Vector(0,0), 0, 0, mg);
    var skeleton;

    var drawer = new Drawer(canvas);
    var loop = new GameLoop();
    var level = new Level(canvas, drawer, map);

    //Does it belong here?
    var sound = new SoundController();
    var ui = new InterfaceController(loop); //TODO: hmmm...
    var input = new InputController(canvas.element);
    Resources = new ResourceManager();
    input.loadKeyMappings(Config.keyMappings);

    document.getElementById('debug').hidden = true;
    document.getElementById('interface').hidden = true;


    new TaskCollection([
            function loadMap(callback) {
                        callback();

            }
        //function loadMap(callback) {
        //    Resources.retrieveJson('testMap', (json) => {
        //        map.loadMap(json, function() {
        //            callback();
        //        });
        //    });
        //}
    ],
        function complete() {
            var bullets = [];
            for (var i = 0; i < 10; i++) {
                bullets.push(new Bullet(new Vector(0,0), 8, 3, null));
                level.addEntity(bullets[i]);
            }
            var gun = new Gun(new Vector(5, 5), 14, 5, null, bullets);
            var player = new Player(new Vector(200, 500), 30, 50, null, input, gun);
            var zombie = new Zombie(new Vector(0, 0), 20, 60, null, player);
            level.addEntity(player);
            level.addEntity(gun);
            level.addEntity(zombie);
            //level.setObjectToFollow(player);
//          viewport.update(1);
            loop.update = function (dt) { //TODO: remove hack
                level.update(dt);
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