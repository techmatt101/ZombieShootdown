class WeaponFactory {

    static spawnBullet() {
        var bullet = new Entity('Bullet', new Box(8, 5));

        bullet.addComponent(new Material());
        bullet.addComponent(new Collision(bullet.geometry));
        bullet.addComponent(new Movement(bullet.pos, 60));
        bullet.addComponent(new Damage(30));
        bullet.buildComponents();

        bullet.components.collision.behaviours.zombieDamage = new DamageCollisionBehavior()
            .inflictDamage(bullet.components.damage);

        bullet.components.collision.on(CollisionEvents.COLLIDE, () => {
            bullet.available = true;
            bullet.active = false;
        });

        return bullet;
    }

    static spawnGun(bulletPool : Pool<Entity>) {
        var gun = new Gun('Gun', new Box(14, 5), bulletPool);
        
        gun.addComponent(new Material());
        gun.buildComponents();

        return gun;
    }
}