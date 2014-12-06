class BunnyTesterGame {
    loop : GameLoop;
    canvas : Canvas;
    renderer : CanvasRenderer;
    systems : Systems;

    camera : Camera;
    level : Level;

    bunnyTest : BunnyTest;


    constructor() {
        var self = this;
        this.loop = new GameLoop((dt : number) => {
            self.update(dt);
        });

        this.canvas = new Canvas(<HTMLCanvasElement> document.getElementById('game'));

        this.camera = new Camera(this.canvas);
        this.renderer = new CanvasRenderer(this.canvas, this.camera);

        this.systems = new Systems();
        this.systems.scheedule(new LogicSystem());
        this.systems.scheedule(new CollisionSystem());
        this.systems.scheedule(new RenderSystem(this.renderer));

        this.level = new Level(this.systems);

        this.bunnyTest = new BunnyTest((bunnyData) => {
            var bunny = new Entity('Bunny', new Box(bunnyData.width, bunnyData.height));
            bunny.addComponent(new Material());
            bunny.addComponent(new Movement(bunny.pos));
            bunny.addComponent(new Collision(bunny.geometry));
            bunny.build();

            bunny.components.material.setTexture(new Texture(bunnyData.img, new Vector(0, 0), bunnyData.width, bunnyData.height));

            this.level.addEntity(bunny);

            return bunny;
        });
    }

    update(dt : number) {
        this.bunnyTest.update(dt);
        this.level.update(dt);
    }

    load() {
        this.bunnyTest.start();
        this.loop.start();
        console.log('GAME OVER MAN!');
    }
}