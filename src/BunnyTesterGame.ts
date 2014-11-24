class BunnyTesterGame {
    loop : GameLoop;
    canvas : Canvas;
    renderer : CanvasLightRenderer;
    systems : SystemManager;

    camera : Camera;
    level : Level;

    bunnyTest : BunnyTest;


    constructor () {
        var self = this;
        this.loop = new GameLoop((dt : number) => {
            self.update(dt);
        });

        this.canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));

        this.camera = new Camera(this.canvas);
        this.renderer = new CanvasLightRenderer(this.canvas, this.camera);

        this.systems = new SystemManager();
        this.systems.logic = new LogicSystem();
        this.systems.collision = new CollisionSystem();
        this.systems.render = new RenderSystem(this.renderer);

        this.level = new Level(this.systems);

        this.bunnyTest = new BunnyTest((bunnyData) => {
            var bunny = new Entity('Bunny', new Box(bunnyData.width, bunnyData.height));
            bunny.addComponent(new Collision(bunny.geometry));
            bunny.addComponent(new Movement(bunny.pos));
            bunny.build();

            this.level.addEntity(bunny);

            return bunny;
        });
    }

    update (dt : number) {
        this.bunnyTest.update(dt);
        this.level.update(dt);
    }

    load () {
        this.bunnyTest.start();
        this.loop.start();
        console.log('GAME OVER MAN!');
    }
}