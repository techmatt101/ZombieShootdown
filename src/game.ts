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

function gameSetup() {
    console.time("Load_Setup");

    var canvas;
    //canvas = new Canvas<WebGLRenderingContext>(<HTMLCanvasElement> document.getElementById('game'));
    canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));
    canvas.context = canvas.element.getContext('2d');

    var map = new MapManager(0, 0, 0, 0, [], null);
    var skeleton;

    var drawer = new Drawer(canvas);
    var loop = new GameLoop();
    var level = new Level(canvas, drawer, map);

    //Does it belong here?
    Sound = new SoundController();
    Interface = new InterfaceController(loop); //TODO: hmmm...
    Input = new InputController(canvas.element);
    Resources = new ResourceManager();
    Input.loadKeyMappings(Config.keyMappings);

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
            var gun = new Gun(new Vector(5, 5), 5, 5, null);
            var player = new Player(new Vector(200, 500), 30, 50, null, gun);
            var zombie = new Zombie(new Vector(0, 0), 30, 50, null, player);
            level.addEntity(player);
            level.addEntity(gun);
            level.addEntity(zombie);
            //level.setObjectToFollow(player);
//          viewport.update(1);
            loop.update = function (dt) { //TODO: remove hack
                level.update(dt);
            };

            loop.start();
            startGame();
        }
    ).run("Loading Resources");
}


function startGame() {

    Interface.loaded();

    console.timeEnd("Load_Setup");
    console.log('GAME OVER MAN!');
}