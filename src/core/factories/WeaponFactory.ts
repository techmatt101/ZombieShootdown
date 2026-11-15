import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Collision, CollisionEvent, CollisionLayer } from '../components/Collision';
import { Damage } from '../components/Damage';
import { Material } from '../components/Material';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { Gun } from '../gameobjects/Gun';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import type { Pool } from '../../lib/Pool';

export function spawnBullet() {
    const bullet = new Entity('Bullet', new Point(0, 0, 0), new Box(8, 5));

    const material = bullet.addComponent(new Material());
    const collision = bullet.addComponent(new Collision(bullet.geometry, CollisionLayer.PROJECTILE, CollisionLayer.ENEMY));
    bullet.addComponent(new Movement(bullet.pos, 80));
    const damage = bullet.addComponent(new Damage(30));

    collision.behaviours.playerDamage = new DamageCollisionBehavior()
        .inflictDamage(damage);

    collision.on(CollisionEvent.COLLIDE, () => {
        bullet.available = true;
        bullet.active = false;
    });

    material.zIndex = ZIndexLayer.FOREGROUND + 1;

    bullet.build();

    return bullet;
}

export function spawnGun(bulletPool : Pool<Entity>) {
    const gun = new Gun('Gun', new Point(0, 0, 0), new Box(14, 5), bulletPool);

    const material = gun.addComponent(new Material());

    material.zIndex = ZIndexLayer.FOREGROUND + 1;

    gun.build();

    return gun;
}
