import { Game } from './Game';
import { SinglePlayerWaveLogic } from './logic/SinglePlayerWaveLogic';
import { WeaponiseDecorator } from '../core/decorators/WeaponiseDecorator';
import { Entity } from '../core/Entity';
import { InterfaceFactory } from '../core/factories/InterfaceFactory';
import { PlayerFactory } from '../core/factories/PlayerFactory';
import { WeaponFactory } from '../core/factories/WeaponFactory';
import { AISystem } from '../core/systems/AISystem';
import { Pool } from '../lib/Pool';

export class SinglePlayerGame extends Game {
    logic : SinglePlayerWaveLogic;

    constructor() {
        super();
        this.systems.schedule(new AISystem(this.map));
        this.logic = new SinglePlayerWaveLogic(this.level);
    }

    onCompete() {
        super.onCompete();
        this.logic.start(this.player);
    }

    load() {
        var game = this;

        this.levelSetupTasks
            .add(function LevelEntities() {
                game.pointer = InterfaceFactory.spawnPointer(game.inputState, game.camera);
                game.level.addEntity(game.pointer);

                var bulletPool = new Pool<Entity>(() => {
                    var bullet = WeaponFactory.spawnBullet();
                    game.level.addEntity(bullet);
                    return bullet;
                });

                var gun = WeaponFactory.spawnGun(bulletPool);
                game.player = PlayerFactory.spawnPlayer(game.map.getGenerator().getMainRoom(), game.inputState);
                WeaponiseDecorator.giveGun(game.player, gun);

                game.level.addEntity(game.player);
                game.level.addEntity(gun);
            })
            .add(function LevelTweaks() {
                game.level.setObjectToFollow(game.player);
                game.lighting?.setLightSource(game.player.pos);
            });

        super.load();
    }
}
