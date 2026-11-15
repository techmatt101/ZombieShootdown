import { BunnyTest } from './BunnyTest';
import { Collision } from '../core/components/Collision';
import { Material } from '../core/components/Material';
import { Movement } from '../core/components/Movement';
import { Entity } from '../core/Entity';
import { Level } from '../core/level/Level';
import { CanvasRenderer } from '../core/render/CanvasRenderer';
import { Systems } from '../core/Systems';
import { CollisionSystem } from '../core/systems/CollisionSystem';
import { LogicSystem } from '../core/systems/LogicSystem';
import { RenderSystem } from '../core/systems/RenderSystem';
import { Camera } from '../lib/Camera';
import { Canvas } from '../lib/Canvas';
import { GameLoop } from '../lib/GameLoop';
import { Box } from '../lib/geometry/Box';
import { Point } from '../lib/geometry/Point';
import { Vector } from '../lib/geometry/Vector';
import { byId } from '../lib/dom';
import { Texture } from '../lib/Texture';

export class BunnyTesterGame {
    loop : GameLoop;
    canvas : Canvas;
    renderer : CanvasRenderer;
    systems : Systems<Entity>;

    camera : Camera;
    level : Level;

    bunnyTest : BunnyTest<Entity>;


    constructor() {
        this.loop = new GameLoop((dt : number) => {
            this.update(dt);
        });

        this.canvas = new Canvas(byId<HTMLCanvasElement>('game'));

        this.camera = new Camera(this.canvas.center);
        this.renderer = new CanvasRenderer(this.canvas, this.camera);

        this.systems = new Systems();
        this.systems.schedule(new LogicSystem());
        this.systems.schedule(new CollisionSystem());
        this.systems.schedule(new RenderSystem(this.renderer));

        this.level = new Level(this.systems);

        this.bunnyTest = new BunnyTest((bunnyData) => {
            const bunny = new Entity('Bunny', new Point(0, 0, 0), new Box(bunnyData.width, bunnyData.height));
            const material = bunny.addComponent(new Material());
            bunny.addComponent(new Movement(bunny.pos));
            bunny.addComponent(new Collision(bunny.geometry));
            bunny.build();

            material.setTexture(new Texture(bunnyData.img, new Vector(0, 0), bunnyData.width, bunnyData.height));

            this.level.addEntity(bunny);

            return bunny;
        });
    }

    update(dt : number) {
        this.bunnyTest.update(dt);
        this.systems.update(dt);
    }

    dispose() {
        this.loop.pause();
        this.bunnyTest.stop();
    }

    load() {
        this.bunnyTest.start();
        this.loop.start();
        console.log('GAME OVER MAN!');
    }
}
