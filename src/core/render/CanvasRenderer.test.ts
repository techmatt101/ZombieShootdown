import { describe, expect, it } from 'vitest';
import { CanvasRenderer } from './CanvasRenderer';
import { Material } from '../components/Material';
import { Entity } from '../Entity';
import { RenderSystem } from '../systems/RenderSystem';
import { Camera } from '../../lib/Camera';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { fakeCanvas, recordingContext } from '../../testing/fakeCanvas';

function sprite(x : number, y : number, zIndex = 0) {
    const entity = new Entity('Sprite', new Point(x, y, 0), new Box(40, 40));
    const material = entity.addComponent(new Material());
    material.zIndex = zIndex;
    entity.build();
    return entity;
}

function setUp() {
    const { context, count, calls } = recordingContext();
    const canvas = fakeCanvas(context);
    const camera = new Camera(canvas.center);
    camera.setTarget(new Vector(0, 0));
    camera.jumpToTarget();
    return { renderer: new CanvasRenderer(canvas, camera), count, calls };
}

describe('CanvasRenderer', () => {
    it('draws only entities whose sprite reaches the screen', () => {
        const { renderer, count } = setUp();
        renderer.render([sprite(0, 0), sprite(580, 0), sprite(700, 0), sprite(0, -5000)]);
        renderer.paint();
        expect(count('fillRect')).toBe(2);
    });

    it('draws the background layer before entities', () => {
        const { renderer, calls } = setUp();
        renderer.setBackground({ draw: (ctx) => ctx.drawImage({} as CanvasImageSource, 0, 0) });
        renderer.render([sprite(0, 0)]);
        renderer.paint();
        const drawOrder = calls.filter((call) => call.method === 'drawImage' || call.method === 'fillRect').map((call) => call.method);
        expect(drawOrder).toEqual(['drawImage', 'fillRect']);
    });

    it('draws each sprite with its own opacity, adding additive sprites onto the scene', () => {
        const { context, calls } = recordingContext();
        const camera = new Camera(fakeCanvas(context).center);
        camera.setTarget(new Vector(0, 0));
        camera.jumpToTarget();
        const renderer = new CanvasRenderer(fakeCanvas(context), camera);
        const drawnWith : { alpha : number; blend : string }[] = [];
        const fillRect = context.fillRect.bind(context);
        context.fillRect = (...args) => {
            drawnWith.push({ alpha: context.globalAlpha, blend: context.globalCompositeOperation });
            fillRect(...args);
        };
        const plain = sprite(0, 0, 0);
        const glow = sprite(0, 0, 1);
        glow.getComponent('material').opacity = 0.4;
        glow.getComponent('material').isAdditive = true;
        renderer.render([plain, glow]);
        renderer.paint();
        expect(drawnWith).toEqual([{ alpha: 1, blend: 'source-over' }, { alpha: 0.4, blend: 'lighter' }]);
        expect(calls.filter((call) => call.method === 'save').length).toBe(calls.filter((call) => call.method === 'restore').length);
    });
});

describe('RenderSystem', () => {
    it('hands the renderer its entities sorted by z-index', () => {
        let rendered : Entity[] = [];
        const system = new RenderSystem({ render: (entities : Entity[]) => { rendered = entities; } } as unknown as CanvasRenderer);
        const top = sprite(0, 0, 10), bottom = sprite(0, 0, 0);
        system.add(top);
        system.add(bottom);
        system.add(new Entity('No material', new Point(0, 0, 0), new Box(1, 1)));
        system.update(1);
        expect(rendered).toEqual([bottom, top]);
    });
});
