class Game {
    systems : Systems;
    map : MapManager;
    level : TopDownLevel;
    logic : WaveLogic;

    players : Entity[];


    constructor () {
        // Systems
        this.systems = new Systems();
        this.systems.scheedule(new LogicSystem());
        this.systems.scheedule(new AISystem(this.map));
        this.systems.scheedule(new CollisionSystem());

        this.level = new TopDownLevel(this.map, null, this.systems);
        this.logic = new WaveLogic(this.level);
    }

    update (dt : number) {
        this.level.update(dt);
    }

    load () {
        var game = this;

        new TaskCollection('Level Setup', function onCompete () {
            game.logic.start(game.player);
            console.log('GAME OVER MAN!');
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
                game.players.push(PlayerFactory.spawnPlayer(game.map.mapGenerator.getMainRoom(), game.input, game.camera, gun));

                game.level.addEntity(game.player);
                game.level.addEntity(gun);
            })
            .run();
    }
}