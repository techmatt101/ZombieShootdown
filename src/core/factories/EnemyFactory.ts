class EnemyFactory {
    static spawnZombie(room : Room, player: Entity) {
        var zombie = new Entity('Zombie', new Box(20, 60,
            new Vector(
                room.pos.x + Math.random() * room.width,
                room.pos.y + Math.random() * room.height
            )), null);

        zombie.addAttr(new ZombieAI2(player));
        zombie.addAttr(new Movement(5));
        zombie.addAttr(new Health(200));

        return zombie;
    }
}