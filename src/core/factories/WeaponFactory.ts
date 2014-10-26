class WeaponFactory {

    static spawnBullet() {
        var bullet = new Entity('Bullet', new Box(5, 8), null);

        bullet.components.add(new Collision(<Box> bullet.geometry));
        bullet.components.add(new Movement(bullet.pos));
        bullet.components.build();

        return bullet;
    }

    static spawnBullets(n) {
        var bullets = [];
        for (var i = 0; i < n; i++) {
            bullets.push(WeaponFactory.spawnBullet());
        }

        return bullets;
    }

    static spawnGun(bullets : Bullet[]) {
        var gun = new Entity('Gun', new Box(14, 5), null);

        return gun;
    }
}