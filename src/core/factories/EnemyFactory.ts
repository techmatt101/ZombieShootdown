import { ZombieAI } from '../ai/ZombieAI';
import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { AI } from '../components/AI';
import { Collision } from '../components/Collision';
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

export function spawnZombie(target : Entity) {
    const zombie = new Entity('Zombie', new Point(0, 0, 0), new Box(48, 48));

    zombie.addComponent(new AI(new ZombieAI(zombie, target)));
    zombie.addComponent(new Movement(zombie.pos, randInt(14, 25), 1));
    const collision = zombie.addComponent(new Collision(zombie.geometry));

    const material = zombie.addComponent(new Material());
    zombie.addComponent(new SpriteAnimator(material));

    const health = zombie.addComponent(new Health(100));
    const damage = zombie.addComponent(new Damage(1));

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
