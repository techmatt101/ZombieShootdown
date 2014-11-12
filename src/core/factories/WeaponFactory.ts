class WeaponFactory {

    static spawnBullet() {
        var bullet = new Entity('Bullet', new Box(8, 5));

        bullet.components.add(new Collision(bullet.geometry));
        bullet.components.add(new Movement(bullet.pos, 60));
        bullet.components.build();

        (<Collision> bullet.components.get(Collision)).on(CollisionEvents.COLLIDE, () => {
            bullet.available = true;
            bullet.active = false;
        });

        return bullet;
    }

    static spawnGun(bulletPool : Pool<Entity>) : Gun {
        return new Gun('Gun', new Box(14, 5), bulletPool);
    }
}