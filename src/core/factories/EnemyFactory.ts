class EnemyFactory {

    static spawnZombie(target: Entity) {
        var zombie = new Entity('Zombie', new Box(48, 48, new Vector(0,0)));

        zombie.addComponent(new AI(new ZombieAI(zombie, target)));
        zombie.addComponent(new Movement(zombie.pos, randInt(14, 25), 1));
        zombie.addComponent(new Collision(zombie.geometry));

        zombie.addComponent(new Material());
        zombie.addComponent(new SpriteAnimator(zombie.components.material));

        zombie.addComponent(new Health(100));
        zombie.addComponent(new Damage(1));

        zombie.components.collision.behaviours.zombieDamage = new DamageCollisionBehavior()
            .inflictDamage(zombie.components.damage);

        zombie.components.collision.behaviours.playerDamage = new DamageCollisionBehavior()
            .acceptDamage(zombie.components.health);

        ResourceManager.retrieveImage('zombie', (img : HTMLImageElement) => {
            zombie.components.material.setTexture(new Texture(img, new Vector(0,0), 62, 48, new Vector(0,0), 28, 20));
        });

        zombie.build();

        return zombie;
    }

    static spawnDeadZombie() {
        var zombie = new Entity('Dead Zombie', new Box(48, 48, new Vector(0,0)));

        zombie.addComponent(new Material());

        ResourceManager.retrieveImage('zombie-death', (img : HTMLImageElement) => {
            zombie.components.material.setTexture(new Texture(img, new Vector(0,0), 48, 48, new Vector(66,2), 30, 30));
        });

        zombie.build();

        return zombie;
    }
}