class WaveLogic {
    score = 0;
    wave = 0;
    private _game : Game;
    private _zombieEventCollection : EventCollection;
    private _zombiePool : Pool<Entity>;


    constructor(game : Game) {
        this._game = game;

        var self = this;
        this._zombieEventCollection = new EventCollection(() => {
            self.spawnWave();
        }, () => {
            self.score += 10;
        });

        this._zombiePool = new Pool<Entity>(() => {
            var zombie = EnemyFactory.spawnZombie(self._game.map.mapGenerator.getRandomRoom(), self._game.player);
            zombie.components.health.on(HealthEvents.DEATH, self._zombieEventCollection.listen());
            this._game.level.addEntity(zombie);

            return zombie;
        });
    }

    start() {
        this._game.player.components.health.on(HealthEvents.DEATH, () => {
            console.log("GAME OVER MAN!");
        });
        this.spawnWave();
    }

    spawnWave() {
        this.wave++;

        var numberOfZombies = ~~(this.wave * 1.5 + 3);
        for (var i = 0; i < numberOfZombies; i++) {
            this._zombiePool.acquire();
        }

        this._zombieEventCollection.reset(numberOfZombies);

        console.log("WAVE " + this.wave + " HAS BEGUN! SPAWNED " + numberOfZombies + " ZOMBIES");
    }
}