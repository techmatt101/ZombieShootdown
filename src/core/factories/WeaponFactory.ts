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
    const gun = new Gun('Gun', new Point(0, 0, 0), new Box(GUN_LENGTH, 5), bulletPool);

    const material = gun.addComponent(new Material());

    material.zIndex = ZIndexLayer.FOREGROUND + 1;

    gun.build();

    return gun;
}

const FLASH_LENGTH = 32;
const FLASH_WIDTH = 20;
const GUN_LENGTH = 14;
const FLASH_LIGHT_RADIUS = 650;
const FLASH_LIGHT_GLOW = 0.35;

let muzzleFlashTexture : Texture | null = null;

function drawMuzzleFlash() : Texture {
    const canvas = new OffscreenCanvas(FLASH_LENGTH, FLASH_WIDTH);
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('OffscreenCanvas 2D context is not supported');
    }
    const middle = FLASH_WIDTH / 2;

    const glow = ctx.createRadialGradient(8, middle, 0, 8, middle, middle);
    glow.addColorStop(0, 'rgba(255, 200, 80, 0.9)');
    glow.addColorStop(1, 'rgba(255, 90, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, FLASH_LENGTH, FLASH_WIDTH);

    const blast = ctx.createLinearGradient(2, 0, FLASH_LENGTH, 0);
    blast.addColorStop(0, 'rgba(255, 255, 230, 1)');
    blast.addColorStop(0.4, 'rgba(255, 220, 90, 0.9)');
    blast.addColorStop(1, 'rgba(255, 120, 0, 0)');
    ctx.fillStyle = blast;
    ctx.beginPath();
    ctx.moveTo(2, middle - 3);
    ctx.lineTo(FLASH_LENGTH, middle - 7);
    ctx.lineTo(FLASH_LENGTH * 0.7, middle);
    ctx.lineTo(FLASH_LENGTH, middle + 7);
    ctx.lineTo(2, middle + 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.beginPath();
    ctx.arc(6, middle, 3, 0, Math.PI * 2);
    ctx.fill();

    return new Texture(canvas, new Vector(0, 0), FLASH_LENGTH, FLASH_WIDTH, new Vector(0, 0), FLASH_LENGTH, FLASH_WIDTH);
}

export function spawnMuzzleFlash(gun : Gun, holder : Entity) {
    const flash = new Entity('Muzzle Flash', new Point(0, 0, 0), new Box(FLASH_LENGTH, FLASH_WIDTH));

    const material = flash.addComponent(new Material());
    muzzleFlashTexture ??= drawMuzzleFlash();
    material.setTexture(muzzleFlashTexture);
    material.zIndex = ZIndexLayer.FOREGROUND + 2;
    const light = flash.addComponent(new Light(holder.pos, { radius: FLASH_LIGHT_RADIUS, intensity: 0, glow: FLASH_LIGHT_GLOW }));
    const muzzleFlash = flash.addComponent(new MuzzleFlash(flash.pos, material, gun.pos, GUN_LENGTH / 2 + FLASH_LENGTH / 2, light));

    flash.build();
    muzzleFlash.reset();
    gun.on(WeaponEvent.FIRED, () => muzzleFlash.trigger());

    return flash;
}
