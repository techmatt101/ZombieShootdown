import { ZombieAI } from '../ai/ZombieAI';
import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { AI } from '../components/AI';
import { Collision, CollisionLayer } from '../components/Collision';
import { Damage } from '../components/Damage';
import { Health } from '../components/Health';
import { Material } from '../components/Material';
import { Movement } from '../components/Movement';
import { ShadowCaster } from '../components/ShadowCaster';
import { SpriteAnimator } from '../components/SpriteAnimator';
import { Entity } from '../Entity';
import { VIEW_DISTANCE } from './PlayerFactory';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Box } from '../../lib/geometry/Box';
import { Circle } from '../../lib/geometry/Circle';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { randInt } from '../../lib/helpers';
import { loadImage } from '../../lib/assets';
import { normalMapOf } from '../../lib/spriteNormals';
import type { ISpriteAnimationData } from '../animation/SpriteAnimation';
import { Texture, type TextureSource } from '../../lib/Texture';

const MIN_CHASE_SPEED = 14;
const MAX_CHASE_SPEED = 25;
const BITE_DAMAGE = 6;
const BITE_COOLDOWN = 1;
const BODY_RADIUS = 21;
const ZOMBIE_COLLIDES_WITH = CollisionLayer.PLAYER | CollisionLayer.ENEMY | CollisionLayer.PROJECTILE | CollisionLayer.PROP;
const ZOMBIE_FRAME_WIDTH = 28;
const ZOMBIE_FRAME_HEIGHT = 20;

const DEATH_CELL = 33;
const DEATH_DRAWN_SCALE = 2.2;
const DEATH_DRAWN_SIZE = Math.round(DEATH_CELL * DEATH_DRAWN_SCALE);
const FALLING_BODY_X = 1;
const BLOOD_BURST_X = 32;
const BLOOD_POOL_X = 64;
const SPREAD_POOL_X = 111;

function deathFrame(x : number, shownUntil : number) {
    return { x, y: 0, width: DEATH_CELL, height: DEATH_CELL, time: shownUntil };
}

export const DYING : ISpriteAnimationData = {
    animationTime: 7,
    playsOnce: true,
    spriteSequence: [
        deathFrame(FALLING_BODY_X, 1.5),
        deathFrame(BLOOD_BURST_X, 3),
        deathFrame(BLOOD_POOL_X, 6),
        deathFrame(SPREAD_POOL_X, 7),
    ],
};

const SHAMBLE : ISpriteAnimationData = {
    animationTime: 4,
    spriteSequence: [
        { x: 0, y: 0, width: ZOMBIE_FRAME_WIDTH, height: ZOMBIE_FRAME_HEIGHT, time: 2 },
        { x: 0, y: ZOMBIE_FRAME_HEIGHT, width: ZOMBIE_FRAME_WIDTH, height: ZOMBIE_FRAME_HEIGHT, time: 4 },
    ],
};

export function spawnZombie(target : Entity) {
    const zombie = new Entity('Zombie', new Point(0, 0, 0), new Box(48, 48));

    const chaseSpeed = randInt(MIN_CHASE_SPEED, MAX_CHASE_SPEED);
    zombie.addComponent(new AI(new ZombieAI(zombie, target, chaseSpeed, VIEW_DISTANCE)));
    zombie.addComponent(new Movement(zombie.pos, chaseSpeed, 1));
    const collision = zombie.addComponent(new Collision(new Circle(BODY_RADIUS, zombie.pos), CollisionLayer.ENEMY, ZOMBIE_COLLIDES_WITH));
    zombie.addComponent(new ShadowCaster(zombie.pos, BODY_RADIUS));

    const material = zombie.addComponent(new Material());
    zombie.addComponent(new SpriteAnimator(material, SHAMBLE));
    material.zIndex = ZIndexLayer.ENEMY;
    material.isHiddenOutOfSight = true;

    const health = zombie.addComponent(new Health(100));
    const damage = zombie.addComponent(new Damage(BITE_DAMAGE, BITE_COOLDOWN));

    collision.behaviours.zombieDamage = new DamageCollisionBehavior()
        .inflictDamage(damage);

    collision.behaviours.playerDamage = new DamageCollisionBehavior()
        .acceptDamage(health);

    void Promise.all([loadImage('zombie'), loadImage('zombie_n')]).then(([img, normals]) => {
        const texture = new Texture(img, new Vector(0, 0), 62, 48, new Vector(0, 0), ZOMBIE_FRAME_WIDTH, ZOMBIE_FRAME_HEIGHT);
        texture.normals = normals;
        material.setTexture(texture);
    });

    zombie.build();

    return zombie;
}

export function loadDeathSheet() {
    return loadImage('zombie-death');
}

export function spawnDeadZombie(deathSheet : TextureSource) {
    const zombie = new Entity('Dead Zombie', new Point(0, 0, 0), new Box(DEATH_DRAWN_SIZE, DEATH_DRAWN_SIZE, new Vector(0, 0)));

    const material = zombie.addComponent(new Material());
    zombie.addComponent(new SpriteAnimator(material, DYING));

    const texture = new Texture(deathSheet, new Vector(0, 0), DEATH_DRAWN_SIZE, DEATH_DRAWN_SIZE, new Vector(FALLING_BODY_X, 0), DEATH_CELL, DEATH_CELL);
    texture.normals = normalMapOf(deathSheet);
    material.setTexture(texture);

    material.zIndex = ZIndexLayer.BACKGROUND;

    zombie.build();

    return zombie;
}
