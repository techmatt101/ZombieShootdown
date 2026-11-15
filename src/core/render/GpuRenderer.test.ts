import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LightingSource } from './gpu/GpuPainter';
import { GpuRenderer } from './GpuRenderer';
import { SpriteKind, type SpriteBatch } from './SpriteBatch';
import { Light } from '../components/Light';
import { Material } from '../components/Material';
import { Entity } from '../Entity';
import { Camera } from '../../lib/Camera';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { Texture } from '../../lib/Texture';
import type { LitArea } from '../../lighting/LightField';
import { MEMORY_SIZE, type RememberedChunk } from '../../lighting/MapMemory';
import { fakeGpu, stubGpuGlobals } from '../../testing/fakeGpu';

vi.mock('../../lib/assets', () => ({ loadImage: () => Promise.resolve({ width: 100, height: 100 }) }));

beforeEach(() => {
    stubGpuGlobals();
});

const sheet = { width: 64, height: 64 } as HTMLImageElement;
const TRIANGLE = new Float32Array([0, 0, 10, 0, 10, 10]);
const TRIANGLE_FAN_VERTICES = 9;

function sprite({ isHiddenOutOfSight = false, isAdditive = false, source = sheet as HTMLImageElement | null } = {}) {
    const entity = new Entity('Sprite', new Point(0, 0, 0), new Box(40, 40));
    const material = entity.addComponent(new Material());
    material.isHiddenOutOfSight = isHiddenOutOfSight;
    material.isAdditive = isAdditive;
    entity.build();
    if (source !== null) {
        material.setTexture(new Texture(source, new Vector(0, 0), 40, 40));
    }
    return entity;
}

function cameraOnOrigin() {
    const camera = new Camera({ x: 600, y: 300 });
    camera.setTarget(new Vector(0, 0));
    camera.jumpToTarget();
    return camera;
}

function lightingWith(lights : Light[], remembered : RememberedChunk[] = []) {
    const areas = new Map<Light, LitArea>();
    for (const light of lights) {
        areas.set(light, { x: light.pos.x, y: light.pos.y, radius: light.radius, tileMapVersion: 0, polygon: TRIANGLE });
    }
    const lighting = {
        lights,
        version: 1,
        litAreaOf: (light : Light) => areas.get(light),
        rememberedInView: (camera : Camera, out : RememberedChunk[]) => {
            out.length = 0;
            out.push(...remembered);
        },
    };
    return lighting satisfies LightingSource;
}

async function readyRenderer(canvas = { width: 1200, height: 600 }) {
    const gpu = fakeGpu(canvas);
    const renderer = new GpuRenderer(cameraOnOrigin());
    await renderer.init(gpu.gpu);
    return { renderer, gpu };
}

function remembered(version = 1) : RememberedChunk {
    return { key: '0,0', left: 0, top: 0, mask: new Uint8Array(MEMORY_SIZE * MEMORY_SIZE), version };
}

describe('GpuRenderer', () => {
    it('paints nothing until the GPU is ready', () => {
        const renderer = new GpuRenderer(cameraOnOrigin());
        renderer.render([sprite()]);
        expect(() => renderer.paint()).not.toThrow();
        expect(renderer.drawCalls).toBe(0);
    });

    it('lights the scene: brightness, sight stencil, sprites, darkness, warm glow, then additive sprites', async () => {
        const { renderer, gpu } = await readyRenderer();
        const eyes = new Light(new Vector(0, 0), { radius: 500, isSight: true });
        const lamp = new Light(new Vector(0, 0), { radius: 600, glow: 0.5 });
        renderer.setLighting(lightingWith([eyes, lamp], [remembered()]));
        renderer.render([sprite(), sprite({ isHiddenOutOfSight: true }), sprite({ isAdditive: true })]);
        renderer.paint();
        expect(gpu.draws.map((draw) => `${draw.pass}:${draw.pipeline}`)).toEqual([
            'light:memory',
            'light:brightness',
            'light:brightness',
            'scene:sight stencil',
            'scene:sprite',
            'scene:sprite in sight',
            'scene:multiply',
            'scene:glow',
            'scene:sprite additive',
        ]);
        expect(renderer.drawCalls).toBe(9);
        expect(gpu.stencilReferences).toEqual([1]);
    });

    it('draws each light as its own fan, tagged with the light it belongs to', async () => {
        const { renderer, gpu } = await readyRenderer();
        renderer.setLighting(lightingWith([new Light(new Vector(0, 0), { radius: 500 }), new Light(new Vector(5, 5), { radius: 600 })]));
        renderer.paint();
        const brightness = gpu.draws.filter((draw) => draw.pipeline === 'brightness');
        expect(brightness.map(({ vertexCount, firstVertex, firstInstance }) => ({ vertexCount, firstVertex, firstInstance }))).toEqual([
            { vertexCount: TRIANGLE_FAN_VERTICES, firstVertex: 0, firstInstance: 0 },
            { vertexCount: TRIANGLE_FAN_VERTICES, firstVertex: TRIANGLE_FAN_VERTICES, firstInstance: 1 },
        ]);
    });

    it('draws everything in plain view without lighting', async () => {
        const { renderer, gpu } = await readyRenderer();
        renderer.render([sprite(), sprite({ isHiddenOutOfSight: true }), sprite({ isAdditive: true })]);
        renderer.paint();
        expect(gpu.pipelinesDrawn()).toEqual(['sprite', 'sprite', 'sprite additive']);
    });

    it('draws a run of sprites sharing a texture in one call', async () => {
        const { renderer, gpu } = await readyRenderer();
        renderer.render([sprite(), sprite(), sprite(), sprite({ source: null })]);
        renderer.paint();
        expect(gpu.draws.map((draw) => draw.instanceCount)).toEqual([3, 1]);
    });

    it('queues the background before the entities', async () => {
        const { renderer, gpu } = await readyRenderer();
        const chunkBitmap = { width: 672, height: 672 } as ImageBitmap;
        renderer.setBackground({ queue: (batch : SpriteBatch) => batch.place(chunkBitmap, SpriteKind.SCENE, 0, 0, 0, 0, 0, 672, 672) });
        renderer.render([sprite()]);
        renderer.paint();
        expect(gpu.draws.map((draw) => draw.firstInstance)).toEqual([0, 1]);
    });

    it('uploads each texture once, and frees it when released', async () => {
        const { renderer, gpu } = await readyRenderer();
        renderer.render([sprite()]);
        renderer.paint();
        renderer.paint();
        expect(gpu.writesTo('sprite')).toBe(1);
        renderer.release(sheet);
        const spriteTextures = gpu.textures.filter((texture) => texture.label === 'sprite');
        expect(spriteTextures.map((texture) => texture.isDestroyed)).toEqual([true]);
        renderer.paint();
        expect(gpu.writesTo('sprite')).toBe(2);
    });

    it('uploads light fans only when the lit areas or lights change', async () => {
        const { renderer, gpu } = await readyRenderer();
        const eyes = new Light(new Vector(0, 0), { radius: 500, isSight: true });
        const lighting = lightingWith([eyes]);
        renderer.setLighting(lighting);
        renderer.paint();
        renderer.paint();
        expect(gpu.writesTo('light fans')).toBe(1);
        lighting.version++;
        renderer.paint();
        expect(gpu.writesTo('light fans')).toBe(2);
        lighting.lights = [eyes, new Light(new Vector(0, 0), { radius: 600 })];
        renderer.paint();
        expect(gpu.writesTo('light fans')).toBe(3);
    });

    it('uploads a remembered chunk only when what was seen there changes', async () => {
        const { renderer, gpu } = await readyRenderer();
        const memory = remembered();
        renderer.setLighting(lightingWith([], [memory]));
        renderer.paint();
        renderer.paint();
        expect(gpu.writesTo('map memory')).toBe(1);
        memory.version++;
        renderer.paint();
        expect(gpu.writesTo('map memory')).toBe(2);
    });

    it('rebuilds its light and stencil targets when the canvas is resized', async () => {
        const canvas = { width: 1200, height: 600 };
        const { renderer, gpu } = await readyRenderer(canvas);
        renderer.paint();
        renderer.paint();
        const lightTargets = () => gpu.textures.filter((texture) => texture.label === 'light');
        expect(lightTargets().length).toBe(1);
        canvas.width = 1920;
        renderer.paint();
        expect(lightTargets().map((texture) => texture.isDestroyed)).toEqual([true, false]);
    });

    it('frees everything it made and lets go of the canvas when disposed, leaving the shared device alive', async () => {
        const { renderer, gpu } = await readyRenderer();
        renderer.render([sprite()]);
        renderer.paint();
        renderer.dispose();
        expect(gpu.textures.every((texture) => texture.isDestroyed)).toBe(true);
        expect(gpu.isUnconfigured).toBe(true);
        renderer.paint();
        expect(renderer.isReady).toBe(false);
    });

    it('never starts painting if disposed while still loading', async () => {
        const gpu = fakeGpu();
        const renderer = new GpuRenderer(cameraOnOrigin());
        const loading = renderer.init(gpu.gpu);
        renderer.dispose();
        await loading;
        expect(renderer.isReady).toBe(false);
        expect(gpu.textures.length).toBe(0);
    });
});
