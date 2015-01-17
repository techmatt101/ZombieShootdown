/// <reference path="Game" />

module ZombieApp {
    export class MultiPlayerGame extends Game {
        player : Entity;
        players : Entity[];

        onCompete() {
            super.onCompete();
            this.logic.start(this.player);
        }

        load() {
            var game = this;

            //this.levelSetupTasks
            //    .add(function LevelEntities() {
            //        var bulletPool = new Pool<Entity>(() => {
            //            var bullet = WeaponFactory.spawnBullet();
            //            game.level.addEntity(bullet);
            //            return bullet;
            //        });
            //
            //        var gun = WeaponFactory.spawnGun(bulletPool);
            //        game.player = PlayerFactory.spawnPlayer(game.map.mapGenerator.getMainRoom(), game.input, game.camera, gun);
            //
            //        game.level.addEntity(game.player);
            //        game.level.addEntity(gun);
            //    })
            //    .add(function LevelTweaks() {
            //        game.level.setObjectToFollow(game.player);
            //        if (typeof game.lighting !== 'undefined') {
            //            game.lighting.setLightSource(game.player.pos);
            //        }
            //    });

            super.load();
        }
    }
}