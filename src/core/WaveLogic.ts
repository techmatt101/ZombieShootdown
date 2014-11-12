class WaveLogic {
    score = 0;
    wave = 0;
    private _game : Game;


    constructor(game : Game) {
        this._game = game;
    }

    start() {
        (<Health>this._game.player.components.get(Health)).on(HealthEvents.DEATH, () => {
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
                (<Health> zombies[i].components.get(Health)).on(HealthEvents.DEATH, () => {
                    self.score += 10;
                    callback();
                });
            });
        }
    }
}