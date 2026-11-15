import { Game } from './Game';
import { SinglePlayerWaveLogic } from './logic/SinglePlayerWaveLogic';
import { giveGun } from '../core/decorators/WeaponiseDecorator';
import { Entity } from '../core/Entity';
import { spawnPointer } from '../core/factories/InterfaceFactory';
import { spawnPlayer } from '../core/factories/PlayerFactory';
import { spawnBullet, spawnGun } from '../core/factories/WeaponFactory';
import { AISystem } from '../core/systems/AISystem';
import { Pool } from '../lib/Pool';

export class SinglePlayerGame extends Game {
    logic : SinglePlayerWaveLogic;

    constructor() {
        super();
        this.systems.schedule(new AISystem(this.map));
        this.logic = new SinglePlayerWaveLogic(this.level);
    }

    onLoaded() {
        super.onLoaded();
        this.logic.start(this.player);
    }

    load() {
        this.levelSetupTasks
            .add('Level Entities', () => {
                this.pointer = spawnPointer(this.inputState, this.camera);
                this.level.addEntity(this.pointer);

                const bulletPool = new Pool<Entity>(() => {
                    const bullet = spawnBullet();
                    this.level.addEntity(bullet);
                    return bullet;
                });

                const gun = spawnGun(bulletPool);
                this.player = spawnPlayer(this.map.getGenerator().getMainRoom(), this.inputState);
                giveGun(this.player, gun);

                this.level.addEntity(this.player);
                this.level.addEntity(gun);
            })
            .add('Level Tweaks', () => {
                this.level.setObjectToFollow(this.player);
                this.lighting?.setLightSource(this.player.pos);
            });

        return super.load();
    }
}
