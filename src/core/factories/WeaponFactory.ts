class WeaponFactory {

    static spawnBullets(n) {
        var bullets = [];
        for (var i = 0; i < n; i++) {
            bullets.push(new Bullet(new Vector(0,0), 8, 3, null));
        }

        return bullets;
    }

    static spawnGun(bullets : Bullet[]) {
        return new Gun(new Vector(5, 5), 14, 5, null, bullets);
    }
}