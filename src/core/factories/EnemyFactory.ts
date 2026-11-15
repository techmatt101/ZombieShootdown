import { ZombieAI } from '../ai/ZombieAI';
import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { AI } from '../components/AI';
import { Collision, CollisionLayer } from '../components/Collision';
import { Damage } from '../components/Damage';
import { Health } from '../components/Health';
import { Material } from '../components/Material';
import { Movement } from '../components/Movement';
import { SpriteAnimator } from '../components/SpriteAnimator';
import { Entity } from '../Entity';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { randInt } from '../../lib/helpers';
import { loadImage } from '../../lib/assets';
import { Texture } from '../../lib/Texture';

const MIN_CHASE_SPEED = 14;
const MAX_CHASE_SPEED = 25;
const BITE_DAMAGE = 6;
const BITE_COOLDOWN = 1;
const ZOMBIE_COLLIDES_WITH = CollisionLayer.PLAYER | CollisionLayer.ENEMY | CollisionLayer.PROJECTILE;

export function spawnZombie(target : Entity) {
    const zombie = new Entity('Zombie', new Point(0, 0, 0), new Box(48, 48));

    const chaseSpeed = randInt(MIN_CHASE_SPEED, MAX_CHASE_SPEED);
    zombie.addComponent(new AI(new ZombieAI(zombie, target, chaseSpeed)));
    zombie.addComponent(new Movement(zombie.pos, chaseSpeed, 1));
    const collision = zombie.addComponent(new Collision(zombie.geometry, CollisionLayer.ENEMY, ZOMBIE_COLLIDES_WITH));

    const material = zombie.addComponent(new Material());
    zombie.addComponent(new SpriteAnimator(material));
    material.zIndex = ZIndexLayer.ENEMY;
    material.isHiddenOutOfSight = true;

    const health = zombie.addComponent(new Health(100));
    const damage = zombie.addComponent(new Damage(BITE_DAMAGE, BITE_COOLDOWN));

    collision.behaviours.zombieDamage = new DamageCollisionBehavior()
        .inflictDamage(damage);

    collision.behaviours.playerDamage = new DamageCollisionBehavior()
        .acceptDamage(health);

    loadImage('zombie').then((img) => {
        material.setTexture(new Texture(img, new Vector(0, 0), 62, 48, new Vector(0, 0), 28, 20));
    });

    zombie.build();

    return zombie;
}

export function spawnDeadZombie() {
    const zombie = new Entity('Dead Zombie', new Point(0, 0, 0), new Box(48, 48, new Vector(0, 0)));

    const material = zombie.addComponent(new Material());

    loadImage('zombie-death').then((img) => {
        material.setTexture(new Texture(img, new Vector(0, 0), 48, 48, new Vector(66, 2), 30, 30));
    });

    material.zIndex = ZIndexLayer.BACKGROUND;

    zombie.build();

    return zombie;
}
