import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { DoorInteractionBehavior } from '../behaviours/DoorInteractionBehavior';
import { Collision, CollisionLayer } from '../components/Collision';
import { Health } from '../components/Health';
import { InputControl } from '../components/InputControl';
import { Interactor } from '../components/Interactor';
import { Light } from '../components/Light';
import { Material } from '../components/Material';
import { Movement } from '../components/Movement';
import { SpriteAnimator } from '../components/SpriteAnimator';
import type { ISpriteAnimationData } from '../animation/SpriteAnimation';
import { WeaponEvent, type Gun } from '../gameobjects/Gun';
import { Entity } from '../Entity';
import type { InputState } from '../../lib/controllers/InputState';
import { Box } from '../../lib/geometry/Box';
import { Circle } from '../../lib/geometry/Circle';
import type { IVector } from '../../lib/geometry/IVector';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { loadImage } from '../../lib/assets';
import { Texture } from '../../lib/Texture';

const VISION_RADIUS = 500;
const BODY_RADIUS = 21;
const FRAME_WIDTH = 30;
const FRAME_HEIGHT = 18;
const DRAWN_SCALE = 2.6;
const IDLE_FRAME = 4;

function frame(index : number, shownUntil : number) {
    return { x: 0, y: index * FRAME_HEIGHT, width: FRAME_WIDTH, height: FRAME_HEIGHT, time: shownUntil };
}

const FIRING : ISpriteAnimationData = {
    animationTime: 1.5,
    playsOnce: true,
    spriteSequence: [frame(0, 0.4), frame(1, 0.75), frame(2, 1.1), frame(3, 1.45), frame(IDLE_FRAME, 1.5)],
};

export function spawnPlayer(position : IVector, input : InputState) {
    const player = new Entity('Player', new Point(position.x, position.y, 0), new Box(48, 48));

    player.addComponent(new InputControl(player, input));
    const interactor = player.addComponent(new Interactor(input));
    player.addComponent(new Movement(player.pos, 30, 1));
    const collision = player.addComponent(new Collision(new Circle(BODY_RADIUS, player.pos), CollisionLayer.PLAYER, CollisionLayer.ENEMY));

    const material = player.addComponent(new Material());
    player.addComponent(new SpriteAnimator(material, FIRING));
    player.addComponent(new Light(player.pos, { radius: VISION_RADIUS, isSight: true }));

    const health = player.addComponent(new Health(400));

    collision.behaviours.zombieDamage = new DamageCollisionBehavior()
        .acceptDamage(health);

    interactor.behaviours.openDoor = new DoorInteractionBehavior()
        .openDoorsAs(player);

    void Promise.all([loadImage('player'), loadImage('player_n')]).then(([img, normals]) => {
        const texture = new Texture(img, new Vector(0, 0),
            Math.round(FRAME_WIDTH * DRAWN_SCALE), Math.round(FRAME_HEIGHT * DRAWN_SCALE),
            new Vector(0, IDLE_FRAME * FRAME_HEIGHT), FRAME_WIDTH, FRAME_HEIGHT);
        texture.normals = normals;
        material.setTexture(texture);
    });

    player.build();

    return player;
}

export function animateFiring(player : Entity, gun : Gun) {
    gun.on(WeaponEvent.FIRED, () => player.getComponent('spriteAnimator').play());
}
