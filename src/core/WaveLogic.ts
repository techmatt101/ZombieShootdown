class WaveLogic {
    score = 0;
    wave = 0;
    private _game : Game;


    constructor(game : Game) {
        this._game = game;
    }

    start() {
        this._game.player.components.health.on(HealthEvents.DEATH, () => {
            console.log("GAME OVER MAN!");
        });
        this.spawnWave();
    }

    spawnWave() {
        this.wave++;

        var zombies = EnemyFactory.spawnZombies(this.wave + 5 * (this.wave / 3), this._game.map.mapGenerator.getRandomRoom(), this._game.player);

        var self = this;
        var events = new TaskCollection('Wave', () => {
            self.spawnWave();
        });

        for (var i = 0; i < zombies.length; i++) {
            this._game.level.addEntity(zombies[i]);

            events.addAsync((callback) => {
                zombies[i].components.health.on(HealthEvents.DEATH, () => {
                    self.score += 10;
                    callback();
                });
            });
        }
    }
}