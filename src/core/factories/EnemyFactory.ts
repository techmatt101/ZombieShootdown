class EnemyFactory {

    static spawnZombie(room : Room, target: Entity) {
        var zombie = new Entity('Zombie', new Box(20, 60,
            new Vector(
                room.pos.x + Math.random() * room.width,
                room.pos.y + Math.random() * room.height
            )));

        zombie.addComponent(new Material());
        zombie.addComponent(new Collision(zombie.geometry));
        zombie.addComponent(new Movement(zombie.pos, 5, 1));
        zombie.addComponent(new Health(200));
        zombie.addComponent(new Damage(5));
        zombie.addComponent(new AI(new ZombieAI(zombie, target)));

        zombie.components.collision.behaviours.playerDamage = new DamageCollisionBehavior()
            .inflictDamage(zombie.components.damage)
            .acceptDamage(zombie.components.health);

        zombie.buildComponents();

        return zombie;
    }
}