class WaveLogic {
    score = 0;
    wave = 0;

    private _level : TopDownLevel;
    private _player : Entity;
    private _zombieEventCollection : EventCollection;
    private _zombiePool : Pool<Entity>;


    constructor(level : TopDownLevel) {
        this._level = level;

        var self = this;
        this._zombieEventCollection = new EventCollection(() => {
            self.spawnWave();
        }, () => {
            self.score += 10;
        });

        this._zombiePool = new Pool<Entity>(() => {
            var zombie = EnemyFactory.spawnZombie(self._player);
            zombie.components.health.on(HealthEvents.DEATH, self._zombieEventCollection.listen(() => {
                zombie.active = false; //TODO: hack
                zombie.available = true;
                var deadZombie = EnemyFactory.spawnDeadZombie();
                deadZombie.pos.copy(zombie.pos);
                level.addEntity(deadZombie);
            }));
            this._level.addEntity(zombie);

            return zombie;
        });
    }

    start(player : Entity) {
        this._player = player;

        this._player.components.health.on(HealthEvents.DEATH, () => {
            console.log("GAME OVER MAN!");
        });
        this.spawnWave();
    }

    spawnWave() {
        this.wave++;

        var numberOfZombies = ~~(this.wave * 1.5 + 3);
        for (var i = 0; i < numberOfZombies; i++) {
            var zombie = this._zombiePool.acquire();
            zombie.components.health.set(100); //TODO: hack
            this.placeInRoom(zombie.geometry, this._level.getMap().mapGenerator);
        }

        this._zombieEventCollection.reset(numberOfZombies);

        console.log("WAVE " + this.wave + " HAS BEGUN! SPAWNED " + numberOfZombies + " ZOMBIES");
    }

    placeInRoom( box : Box, map : MapGenerator) {
        var t = map.getTileSize(), room = map.getRandomRoom();

        box.pos.set(
            randInt(room.pos.x + t.x + box.width / 2, room.pos.x + room.width - t.x - box.width / 2),
            randInt(room.pos.y + t.y + box.height / 2, room.pos.y + room.height - t.y - box.height / 2)
        );
    }
}