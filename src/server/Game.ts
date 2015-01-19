/// <reference path="dt/core.d.ts" />

var Core : ZombieApp = require('./core.js').ZombieApp;

export module Server {
    export class Game {
        systems : ZombieApp.Systems;
        map : ZombieApp.MapManager;
        level : ZombieApp.TopDownLevel;
        logic : ZombieApp.WaveLogic;

        players : ZombieApp.Entity[];


        constructor () {
            // Systems
            this.systems = new Core.Systems();
            this.systems.schedule(new Core.LogicSystem());
            this.systems.schedule(new Core.AISystem(this.map));
            this.systems.schedule(new Core.CollisionSystem());

            this.level = new Core.TopDownLevel(this.map, null, this.systems);
            this.logic = new Core.WaveLogic(this.level);
        }

        update (dt : number) {
            this.level.update(dt);
        }

        load () {
            var game = this;

            new Core.TaskCollection('Level Setup', function onCompete () {
                game.logic.start(game.players[0]);
                console.log('GAME OVER MAN!');
            })
                .add(function Map () {
                    game.map.loadMap(game.level);
                })
                .add(function LevelEntities () {
                    //var bulletPool = new Core.Pool<ZombieApp.Entity>(() => {
                    //    var bullet = Core.WeaponFactory.spawnBullet();
                    //    game.level.addEntity(bullet);
                    //    return bullet;
                    //});

                    //var gun = Core.WeaponFactory.spawnGun(bulletPool);
                    //game.players.push(PlayerFactory.spawnPlayer(game.map.mapGenerator.getMainRoom(), game.input, game.camera, gun));

                    game.level.addEntity(game.players[0]);
                    //game.level.addEntity(gun);
                })
                .run();
        }
    }
}