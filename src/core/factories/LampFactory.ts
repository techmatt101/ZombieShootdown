import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Collision, CollisionLayer } from '../components/Collision';
import { Health, HealthEvent } from '../components/Health';
import { Lamp, type LampLook } from '../components/Lamp';
import { Light, type LightColour } from '../components/Light';
import { Material } from '../components/Material';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Box } from '../../lib/geometry/Box';
import { Circle } from '../../lib/geometry/Circle';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { normalMapOf } from '../../lib/spriteNormals';
import { Texture } from '../../lib/Texture';

export const LAMP_COLOURS : readonly LightColour[] = [
    { r: 0.45, g: 1, b: 0.3 },
    { r: 1, g: 0.12, b: 0.08 },
    { r: 0.3, g: 0.6, b: 1 },
    { r: 0.75, g: 0.3, b: 1 },
    { r: 0.2, g: 1, b: 0.85 },
];

const LAMP_RADIUS = 340;
const LAMP_GLOW = 0.3;
const LAMP_BODY_RADIUS = 11;
const LAMP_TOUGHNESS = 1;
const LAMP_SIZE = 28;
const LAMP_PIXELS = 16;
const SEED_SCALE = 1000;
const LAMP_COLLIDES_WITH = CollisionLayer.PLAYER | CollisionLayer.ENEMY | CollisionLayer.PROJECTILE | CollisionLayer.PROP;
const IRON = '#2b2b30';
const IRON_DARK = '#18181b';
const RIVET = '#5b5b63';
const BROKEN_GLASS_BRIGHTNESS = 0.22;
const CORE_WHITENESS = 0.6;
const CHANNEL_MAX = 255;

const looks = new Map<LightColour, LampLook>();

export function lampColourFor(tintRoll : number) {
    return LAMP_COLOURS[Math.min(Math.floor(tintRoll * LAMP_COLOURS.length), LAMP_COLOURS.length - 1)];
}

export function spawnLamp() {
    const lamp = new Entity('Lamp', new Point(0, 0, 0), new Box(LAMP_SIZE, LAMP_SIZE));

    const material = lamp.addComponent(new Material());
    material.zIndex = ZIndexLayer.PROP;
    const light = lamp.addComponent(new Light(lamp.pos, { radius: LAMP_RADIUS, glow: LAMP_GLOW }));
    lamp.addComponent(new Movement(lamp.pos, 0, 1));
    const collision = lamp.addComponent(new Collision(new Circle(LAMP_BODY_RADIUS, lamp.pos), CollisionLayer.PROP, LAMP_COLLIDES_WITH));
    const health = lamp.addComponent(new Health(LAMP_TOUGHNESS));
    const control = lamp.addComponent(new Lamp(light, material));

    collision.behaviours.playerDamage = new DamageCollisionBehavior()
        .acceptDamage(health);
    health.on(HealthEvent.DEATH, () => control.break());

    lamp.build();

    return lamp;
}

export function fitLamp(lamp : Entity, x : number, y : number, tintRoll : number, isBroken : boolean) {
    lamp.pos.set(x, y);
    lamp.getComponent('movement').clearPath();
    lamp.getComponent('health').set(isBroken ? 0 : LAMP_TOUGHNESS);
    const colour = lampColourFor(tintRoll);
    lamp.getComponent('lamp').switchOn(lookFor(colour), colour, tintRoll * SEED_SCALE, isBroken);
}

function lookFor(colour : LightColour) : LampLook {
    let look = looks.get(colour);
    if (look === undefined) {
        look = { lit: lanternTexture(colour, 1), broken: lanternTexture(colour, BROKEN_GLASS_BRIGHTNESS) };
        looks.set(colour, look);
    }
    return look;
}

function lanternTexture(colour : LightColour, glassBrightness : number) {
    const canvas = new OffscreenCanvas(LAMP_PIXELS, LAMP_PIXELS);
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('OffscreenCanvas 2D context is not supported');
    }
    ctx.fillStyle = IRON_DARK;
    ctx.fillRect(1, 1, 14, 14);
    ctx.fillStyle = IRON;
    ctx.fillRect(2, 2, 12, 12);
    ctx.fillStyle = cssColour(colour, glassBrightness, 0);
    ctx.fillRect(4, 4, 8, 8);
    ctx.fillStyle = cssColour(colour, glassBrightness, CORE_WHITENESS);
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = IRON_DARK;
    ctx.fillRect(7, 3, 2, 10);
    ctx.fillRect(3, 7, 10, 2);
    ctx.fillStyle = RIVET;
    ctx.fillRect(2, 2, 2, 2);
    ctx.fillRect(12, 2, 2, 2);
    ctx.fillRect(2, 12, 2, 2);
    ctx.fillRect(12, 12, 2, 2);
    const texture = new Texture(canvas, new Vector(0, 0), LAMP_SIZE, LAMP_SIZE);
    texture.normals = normalMapOf(canvas);
    return texture;
}

function cssColour(colour : LightColour, brightness : number, whiteness : number) {
    const channel = (value : number) => Math.round((value + (1 - value) * whiteness) * brightness * CHANNEL_MAX);
    return `rgb(${channel(colour.r)}, ${channel(colour.g)}, ${channel(colour.b)})`;
}
