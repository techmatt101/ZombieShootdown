class WeaponFactory {

    static spawnBullet() {
        var bullet = new Entity('Bullet', new Box(8, 5), null);

        bullet.components.add(new Collision(<Box> bullet.geometry));
        bullet.components.add(new Movement(bullet.pos, 60));
        bullet.components.build();

        return bullet;
    }

    static spawnBullets(n) : Entity[] {
        var bullets = [];
        for (var i = 0; i < n; i++) {
            bullets.push(WeaponFactory.spawnBullet());
        }

        return bullets;
    }

    static spawnGun(bullets : Entity[]) {
        var gun = new Gun('Gun', new Box(14, 5), null, bullets);

        return gun;
    }
}