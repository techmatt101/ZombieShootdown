class WeaponFactory {

    static spawnBullet() : Bullet {
        var bullet = new Bullet('Bullet', new Box(8, 5));

        bullet.components.add(new Collision(bullet.geometry));
        bullet.components.add(new Movement(bullet.pos, 60));
        bullet.components.build();

        return bullet;
    }

    static spawnGun(bulletPool : Pool<Bullet>) : Gun {
        return new Gun('Gun', new Box(14, 5), bulletPool);
    }
}