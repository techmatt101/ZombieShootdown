import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { DoorInteractionBehavior } from '../behaviours/DoorInteractionBehavior';
import { Collision, CollisionLayer } from '../components/Collision';
import { Health } from '../components/Health';
import { InputControl } from '../components/InputControl';
import { Interactor } from '../components/Interactor';
import { Material } from '../components/Material';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import type { InputState } from '../../lib/controllers/InputState';
import { Box } from '../../lib/geometry/Box';
import type { IVector } from '../../lib/geometry/IVector';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { loadImage } from '../../lib/assets';
import { Texture } from '../../lib/Texture';

export function spawnPlayer(position : IVector, input : InputState) {
    const player = new Entity('Player', new Point(position.x, position.y, 0), new Box(48, 48));

    player.addComponent(new InputControl(player, input));
    const interactor = player.addComponent(new Interactor(input));
    player.addComponent(new Movement(player.pos, 30, 1));
    const collision = player.addComponent(new Collision(player.geometry, CollisionLayer.PLAYER, CollisionLayer.ENEMY));

    const material = player.addComponent(new Material());

    const health = player.addComponent(new Health(400));

    collision.behaviours.zombieDamage = new DamageCollisionBehavior()
        .acceptDamage(health);

    interactor.behaviours.openDoor = new DoorInteractionBehavior()
        .openDoorsAs(player);

    loadImage('player').then((img) => {
        material.setTexture(new Texture(img, new Vector(0, 0), 78, 46, new Vector(0, 72), 30, 17));
    });

    player.build();

    return player;
}
