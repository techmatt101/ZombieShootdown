class ZombieSpawner {
    static spawnZombie(room : Room, player : Player) {
        var zombie = new Zombie(new Vector(
            room.pos.x * tileSize + (Math.random() * room.width) * tileSize,
            room.pos.y * tileSize + (Math.random() * room.height) * tileSize
        ), 20, 60,  null);

        zombie.controller = new ZombieAI(zombie, player);;

        return zombie;
    }
}