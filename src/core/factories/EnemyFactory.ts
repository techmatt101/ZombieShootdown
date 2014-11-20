class EnemyFactory {

    static spawnZombie(target: Entity) {
        var zombie = new Entity('Zombie', new Box(42, 30, new Vector(0,0)));

        zombie.addComponent(new Material());
        zombie.addComponent(new Collision(zombie.geometry));
        zombie.addComponent(new Movement(zombie.pos, randInt(4, 15), 1));
        zombie.addComponent(new Health(100));
        zombie.addComponent(new Damage(5));
        zombie.addComponent(new AI(new ZombieAI(zombie, target)));

        zombie.components.collision.behaviours.zombieDamage = new DamageCollisionBehavior()
            .inflictDamage(zombie.components.damage);

        zombie.components.collision.behaviours.playerDamage = new DamageCollisionBehavior()
            .acceptDamage(zombie.components.health);

        ResourceManager.retrieveImage('zombie', (img : HTMLImageElement) => {
            zombie.components.material.setTexture(new Texture(img, 28, 20, new Vector(0,0)));
        });

        zombie.build();

        return zombie;
    }
}