class WeaponFactory {

    static spawnBullet() {
        var bullet = new Entity('Bullet', new Box(8, 5));

        bullet.addComponent(new Material());
        bullet.addComponent(new Collision(bullet.geometry));
        bullet.addComponent(new Movement(bullet.pos, 80));
        bullet.addComponent(new Damage(30));

        bullet.components.collision.behaviours.playerDamage = new DamageCollisionBehavior()
            .inflictDamage(bullet.components.damage);

        bullet.components.collision.on(CollisionEvents.COLLIDE, () => {
            bullet.available = true;
            bullet.active = false;
        });

        bullet.components.material.zIndex = ZIndexLayer.FOREGROUND + 1;

        bullet.build();

        return bullet;
    }

    static spawnGun(bulletPool : Pool<Entity>) {
        var gun = new Gun('Gun', new Box(14, 5), bulletPool);

        gun.addComponent(new Material());

        gun.components.material.zIndex = ZIndexLayer.FOREGROUND + 1;

        gun.build();

        return gun;
    }
}