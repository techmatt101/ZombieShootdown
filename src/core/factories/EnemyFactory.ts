class EnemyFactory {

    static spawnZombie(room : Room, target: Entity) {
        var zombie = new Entity('Zombie', new Box(20, 60,
            new Vector(
                room.pos.x + Math.random() * room.width,
                room.pos.y + Math.random() * room.height
            )));

        zombie.components.add(new Collision(<Box> zombie.geometry));
        zombie.components.add(new Movement(zombie.pos, 5, 1));
        zombie.components.add(new Health(200));
        zombie.components.add(new AI(new ZombieAI(zombie, target)));
        zombie.components.build();

        return zombie;
    }

    static spawnZombies(n : number, room : Room, target: Entity) {
        var zombies = [];
        for (var i = 0; i < n; i++) {
            zombies.push(EnemyFactory.spawnZombie(room, target));
        }

        return zombies;
    }
}