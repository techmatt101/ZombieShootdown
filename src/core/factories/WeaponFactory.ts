import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Collision, CollisionEvent } from '../components/Collision';
import { Damage } from '../components/Damage';
import { Material } from '../components/Material';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { Gun } from '../gameobjects/Gun';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Pool } from '../../lib/Pool';

export class WeaponFactory {

    static spawnBullet() {
        var bullet = new Entity('Bullet', new Point(0, 0, 0), new Box(8, 5));

        const material = bullet.addComponent(new Material());
        const collision = bullet.addComponent(new Collision(bullet.geometry));
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

    static spawnGun(bulletPool : Pool<Entity>) {
        var gun = new Gun('Gun', new Point(0, 0, 0), new Box(14, 5), bulletPool);

        const material = gun.addComponent(new Material());

        material.zIndex = ZIndexLayer.FOREGROUND + 1;

        gun.build();

        return gun;
    }
}
