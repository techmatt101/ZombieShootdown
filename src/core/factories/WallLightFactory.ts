import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Collision, CollisionLayer } from '../components/Collision';
import { Health, HealthEvent } from '../components/Health';
import { Lamp, type LampLook } from '../components/Lamp';
import { Light, type LightColour } from '../components/Light';
import { Material } from '../components/Material';
import { Entity } from '../Entity';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Box } from '../../lib/geometry/Box';
import { Circle } from '../../lib/geometry/Circle';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { normalMapOf } from '../../lib/spriteNormals';
import { Texture } from '../../lib/Texture';

export const WALL_LIGHT_COLOURS : readonly LightColour[] = [
    { r: 1, g: 0.62, b: 0.3 },
    { r: 1, g: 0.8, b: 0.55 },
    { r: 0.7, g: 0.85, b: 0.45 },
    { r: 0.55, g: 0.7, b: 1 },
];

const WALL_LIGHT_RADIUS = 190;
const WALL_LIGHT_BRIGHTNESS = 0.55;
const WALL_LIGHT_FADE = 1.6;
const WALL_LIGHT_HALF_ANGLE = 1.35;
const WALL_LIGHT_SOFT_EDGE = 0.7;
const WALL_LIGHT_TOUGHNESS = 1;
const SCONCE_BODY_RADIUS = 7;
const SCONCE_PIXELS_LONG = 8;
const SCONCE_PIXELS_WIDE = 6;
const SCONCE_SCALE = 2;
const SEED_SCALE = 1000;
const BROKEN_GLASS_BRIGHTNESS = 0.22;
const IRON = '#2b2b30';
const IRON_DARK = '#18181b';
const CORE_WHITENESS = 0.6;
const CHANNEL_MAX = 255;

const looks = new Map<LightColour, LampLook>();

export function wallLightColourFor(tintRoll : number) {
    return WALL_LIGHT_COLOURS[Math.min(Math.floor(tintRoll * WALL_LIGHT_COLOURS.length), WALL_LIGHT_COLOURS.length - 1)];
}

export function spawnWallLight() {
    const wallLight = new Entity('Wall Light', new Point(0, 0, 0), new Box(SCONCE_PIXELS_LONG * SCONCE_SCALE, SCONCE_PIXELS_WIDE * SCONCE_SCALE));

    const material = wallLight.addComponent(new Material());
    material.zIndex = ZIndexLayer.PROP;
    const light = wallLight.addComponent(new Light(wallLight.pos, {
        radius: WALL_LIGHT_RADIUS,
        intensity: WALL_LIGHT_BRIGHTNESS,
        fade: WALL_LIGHT_FADE,
        cone: { aim: wallLight.pos, halfAngle: WALL_LIGHT_HALF_ANGLE, softEdge: WALL_LIGHT_SOFT_EDGE },
    }));
    const collision = wallLight.addComponent(new Collision(new Circle(SCONCE_BODY_RADIUS, wallLight.pos), CollisionLayer.PROP, CollisionLayer.PROJECTILE));
    const health = wallLight.addComponent(new Health(WALL_LIGHT_TOUGHNESS));
    const control = wallLight.addComponent(new Lamp(light, material, WALL_LIGHT_BRIGHTNESS));

    collision.behaviours.playerDamage = new DamageCollisionBehavior()
        .acceptDamage(health);
    health.on(HealthEvent.DEATH, () => control.break());

    wallLight.build();

    return wallLight;
}

export function fitWallLight(wallLight : Entity, x : number, y : number, facing : number, tintRoll : number, isBroken : boolean) {
    wallLight.pos.set(x, y);
    wallLight.pos.direction = facing;
    wallLight.getComponent('health').set(isBroken ? 0 : WALL_LIGHT_TOUGHNESS);
    const colour = wallLightColourFor(tintRoll);
    wallLight.getComponent('lamp').switchOn(lookFor(colour), colour, (x + y) % SEED_SCALE, isBroken);
}

function lookFor(colour : LightColour) : LampLook {
    let look = looks.get(colour);
    if (look === undefined) {
        look = { lit: paintSconce(colour, 1), broken: paintSconce(colour, BROKEN_GLASS_BRIGHTNESS) };
        looks.set(colour, look);
    }
    return look;
}

function paintSconce(colour : LightColour, glassBrightness : number) {
    const canvas = new OffscreenCanvas(SCONCE_PIXELS_LONG, SCONCE_PIXELS_WIDE);
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('OffscreenCanvas 2D context is not supported');
    }
    ctx.fillStyle = IRON_DARK;
    ctx.fillRect(0, 0, 2, 6);
    ctx.fillStyle = IRON;
    ctx.fillRect(2, 2, 2, 2);
    ctx.fillStyle = cssColour(colour, glassBrightness, 0);
    ctx.fillRect(4, 1, 4, 4);
    ctx.fillStyle = cssColour(colour, glassBrightness, CORE_WHITENESS);
    ctx.fillRect(5, 2, 2, 2);
    const texture = new Texture(canvas, new Vector(0, 0), SCONCE_PIXELS_LONG * SCONCE_SCALE, SCONCE_PIXELS_WIDE * SCONCE_SCALE);
    texture.normals = normalMapOf(canvas);
    return texture;
}

function cssColour(colour : LightColour, brightness : number, whiteness : number) {
    const channel = (value : number) => Math.round((value + (1 - value) * whiteness) * brightness * CHANNEL_MAX);
    return `rgb(${channel(colour.r)}, ${channel(colour.g)}, ${channel(colour.b)})`;
}
