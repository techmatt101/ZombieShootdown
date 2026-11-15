import { Game } from './Game';
import type { IGameLogic } from './logic/IGameLogic';
import { giveGun } from '../core/decorators/WeaponiseDecorator';
import type { Entity } from '../core/Entity';
import { spawnPointer } from '../core/factories/InterfaceFactory';
import { spawnPlayer } from '../core/factories/PlayerFactory';
import { spawnBullet, spawnGun } from '../core/factories/WeaponFactory';
import type { TopDownLevel } from '../core/level/TopDownLevel';
import { AISystem } from '../core/systems/AISystem';
import { Pool } from '../lib/Pool';

export type LogicFactory = (level : TopDownLevel) => IGameLogic;

export class SinglePlayerGame extends Game {
    logic : IGameLogic;

    constructor(seed : number, createLogic : LogicFactory) {
        super(seed);
        this.systems.schedule(new AISystem(this.tileMap));
        this.logic = createLogic(this.level);
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
                this.player = spawnPlayer(this.tileMap.spawnPoint(), this.inputState);
                giveGun(this.player, gun);

                this.level.addEntity(this.player);
                this.level.addEntity(gun);
            })
            .add('Level Tweaks', () => {
                this.level.setObjectToFollow(this.player);
                this.camera.jumpToTarget();
                this.lighting?.setLightSource(this.player.pos);
            });

        return super.load();
    }
}
