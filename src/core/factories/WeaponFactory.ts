import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Collision, CollisionEvent, CollisionLayer } from '../components/Collision';
import { Damage } from '../components/Damage';
import { Light } from '../components/Light';
import { Material } from '../components/Material';
import { Movement } from '../components/Movement';
import { MuzzleFlash } from '../components/MuzzleFlash';
import { Entity } from '../Entity';
import { Gun, WeaponEvent } from '../gameobjects/Gun';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import type { Pool } from '../../lib/Pool';
import { Vector } from '../../lib/geometry/Vector';
import { Texture } from '../../lib/Texture';

export function spawnBullet() {
    const bullet = new Entity('Bullet', new Point(0, 0, 0), new Box(8, 5));

    const material = bullet.addComponent(new Material());
    const collision = bullet.addComponent(new Collision(bullet.pos, CollisionLayer.PROJECTILE, CollisionLayer.ENEMY | CollisionLayer.PROP));
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
    const gun = new Gun('Gun', new Point(0, 0, 0), new Box(GUN_LENGTH, 5), bulletPool);

    const material = gun.addComponent(new Material());

    material.zIndex = ZIndexLayer.FOREGROUND + 1;

    gun.build();

    return gun;
}

const GUN_LENGTH = 14;
const FLASH_LIGHT_RADIUS = 600;
const FLASH_PEAK_BRIGHTNESS = 1.5;
const FLASH_LIGHT_GLOW = 0.75;
const FLASH_GLOW_SIZE = 140;
const FLASH_LIGHT_COLOUR = { r: 1, g: 0.92, b: 0.78 };
const FLASH_GLOW_COLOUR = { r: 1, g: 0.6, b: 0.25 };

let flashGlowTexture : Texture | null = null;

function drawFlashGlow() : Texture {
    const canvas = new OffscreenCanvas(FLASH_GLOW_SIZE, FLASH_GLOW_SIZE);
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('OffscreenCanvas 2D context is not supported');
    }
    const middle = FLASH_GLOW_SIZE / 2;
    const glow = ctx.createRadialGradient(middle, middle, 0, middle, middle, middle);
    glow.addColorStop(0, 'rgba(255, 250, 220, 1)');
    glow.addColorStop(0.12, 'rgba(255, 210, 90, 1)');
    glow.addColorStop(0.35, 'rgba(255, 140, 20, 0.75)');
    glow.addColorStop(0.7, 'rgba(255, 90, 0, 0.25)');
    glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, FLASH_GLOW_SIZE, FLASH_GLOW_SIZE);
    return new Texture(canvas, new Vector(0, 0), FLASH_GLOW_SIZE, FLASH_GLOW_SIZE);
}

export function spawnMuzzleFlash(gun : Gun, holder : Entity) {
    const flash = new Entity('Muzzle Flash', new Point(0, 0, 0), new Box(FLASH_GLOW_SIZE, FLASH_GLOW_SIZE));

    const material = flash.addComponent(new Material());
    flashGlowTexture ??= drawFlashGlow();
    material.setTexture(flashGlowTexture);
    material.zIndex = ZIndexLayer.FOREGROUND + 2;
    material.isAdditive = true;
    const light = flash.addComponent(new Light(holder.pos, {
        radius: FLASH_LIGHT_RADIUS, intensity: 0, glow: FLASH_LIGHT_GLOW,
        colour: FLASH_LIGHT_COLOUR, glowColour: FLASH_GLOW_COLOUR,
    }));
    const muzzleFlash = flash.addComponent(new MuzzleFlash(light, { pos: flash.pos, material, muzzle: gun.pos, reach: GUN_LENGTH / 2 }, FLASH_PEAK_BRIGHTNESS));

    flash.build();
    muzzleFlash.reset();
    gun.on(WeaponEvent.FIRED, () => muzzleFlash.trigger());

    return flash;
}
