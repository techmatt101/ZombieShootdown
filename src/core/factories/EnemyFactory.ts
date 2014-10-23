class EnemyFactory {
    static spawnZombie(room : Room, player : Player) {
        var zombie = new Zombie(new Vector(
            room.pos.x + Math.random() * room.width,
            room.pos.y + Math.random() * room.height
        ), 20, 60,  null);

        zombie.controller = new ZombieAI(zombie, player);

        return zombie;
    }
}