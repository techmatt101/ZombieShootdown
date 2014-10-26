class EnemyFactory {
    static spawnZombie(room : Room, player: Entity) {
        var zombie = new Entity('Zombie', new Box(20, 60,
            new Vector(
                room.pos.x + Math.random() * room.width,
                room.pos.y + Math.random() * room.height
            )), null);

        zombie.components.add(new Collision(<Box> zombie.geometry));
        zombie.components.add(new Movement(player.pos, 5));
        zombie.components.add(new Health(200));
        zombie.components.add(new AI(new ZombieAI(zombie, player)));

        return zombie;
    }
}