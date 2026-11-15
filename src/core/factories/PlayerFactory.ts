import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Collision } from '../components/Collision';
import { Health } from '../components/Health';
import { InputControl } from '../components/InputControl';
import { Material } from '../components/Material';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { Room } from '../tilemap/Room';
import { InputState } from '../../lib/controllers/InputState';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { loadImage } from '../../lib/assets';
import { Texture } from '../../lib/Texture';

export function spawnPlayer(room : Room, input : InputState) {
    const player = new Entity('Player', new Point(room.pos.x + room.width / 2, room.pos.y + room.height / 2, 0), new Box(48, 48));

    player.addComponent(new InputControl(player, input));
    player.addComponent(new Movement(player.pos, 30, 1));
    const collision = player.addComponent(new Collision(player.geometry));

    const material = player.addComponent(new Material());

    const health = player.addComponent(new Health(400));

    collision.behaviours.zombieDamage = new DamageCollisionBehavior()
        .acceptDamage(health);

    loadImage('player').then((img) => {
        material.setTexture(new Texture(img, new Vector(0, 0), 78, 46, new Vector(0, 72), 30, 17));
    });

    player.build();

    return player;
}
