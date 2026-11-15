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

function sprite({ isHiddenOutOfSight = false, isAdditive = false, source = sheet as HTMLImageElement | null, normals = null as HTMLImageElement | null } = {}) {
    const entity = new Entity('Sprite', new Point(0, 0, 0), new Box(40, 40));
    const material = entity.addComponent(new Material());
    material.isHiddenOutOfSight = isHiddenOutOfSight;
    material.isAdditive = isAdditive;
    entity.build();
    if (source !== null) {
        const texture = new Texture(source, new Vector(0, 0), 40, 40);
        texture.normals = normals;
        material.setTexture(texture);
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
        areas.set(light, { x: light.pos.x, y: light.pos.y, direction: 0, radius: light.radius, tileMapVersion: 0, polygon: TRIANGLE });
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

    it('lights then softens the light, then draws sprites, darkness, warm glow and additive sprites', async () => {
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
            'light:glow',
            'blur across:blur across',
            'blur down:blur down',
            'scene:sprite',
            'scene:sprite in sight',
            'scene:darken',
            'scene:warm glow',
            'scene:sprite additive',
        ]);
        expect(renderer.drawCalls).toBe(11);
    });

    it('skips the warm glow when no light glows', async () => {
        const { renderer, gpu } = await readyRenderer();
        renderer.setLighting(lightingWith([new Light(new Vector(0, 0), { radius: 500, isSight: true })]));
        renderer.paint();
        expect(gpu.pipelinesDrawn()).not.toContain('glow');
        expect(gpu.pipelinesDrawn()).not.toContain('warm glow');
    });

    it('tells the shaders which lights are sight, so only they reveal zombies', async () => {
        const { renderer, gpu } = await readyRenderer();
        renderer.setLighting(lightingWith([new Light(new Vector(0, 0), { radius: 500, isSight: true }), new Light(new Vector(0, 0), { radius: 600 })]));
        renderer.paint();
        const lights = gpu.lastWriteTo('lights');
        const floatsPerLight = 20, sightFlag = 11;
        expect([lights[sightFlag], lights[floatsPerLight + sightFlag]]).toEqual([1, 0]);
    });

    it('tells the shaders where a cone of light points and how wide it is, and that other lights shine all round', async () => {
        const { renderer, gpu } = await readyRenderer();
        const facing = { direction: Math.PI / 2 };
        renderer.setLighting(lightingWith([
            new Light(new Vector(0, 0), { radius: 700, cone: { aim: facing, halfAngle: 0.4 } }),
            new Light(new Vector(0, 0), { radius: 300 }),
        ]));
        renderer.paint();
        const lights = gpu.lastWriteTo('lights');
        const floatsPerLight = 20, coneAt = 12;
        const [aimX, aimY, outerEdge, innerEdge] = lights.slice(coneAt, coneAt + 4);
        expect(aimX).toBeCloseTo(0, 5);
        expect(aimY).toBeCloseTo(1, 5);
        expect(outerEdge).toBeCloseTo(Math.cos(0.4), 5);
        expect(innerEdge).toBeGreaterThan(outerEdge);
        expect(lights[floatsPerLight + coneAt + 2]).toBeLessThan(-1);
    });

    it('lets a cone fade softly across its whole width, and a light fade faster with distance', async () => {
        const { renderer, gpu } = await readyRenderer();
        const torch = new Light(new Vector(0, 0), { radius: 700, fade: 1.8, cone: { aim: { direction: 0 }, halfAngle: 0.5, softEdge: 0.4 } });
        renderer.setLighting(lightingWith([torch, new Light(new Vector(0, 0), { radius: 300 })]));
        renderer.paint();
        const lights = gpu.lastWriteTo('lights');
        const floatsPerLight = 20, innerEdge = 15, fade = 16;
        expect(lights[innerEdge]).toBeCloseTo(Math.cos(0.1), 5);
        expect(lights[fade]).toBeCloseTo(1.8, 5);
        expect(lights[floatsPerLight + fade]).toBe(1);
    });

    it('gives the shaders each light\'s colour and glow colour', async () => {
        const { renderer, gpu } = await readyRenderer();
        const green = { r: 0.25, g: 1, b: 0.5 }, orange = { r: 1, g: 0.5, b: 0.25 };
        renderer.setLighting(lightingWith([new Light(new Vector(0, 0), { radius: 300, colour: green, glow: 0.5, glowColour: orange })]));
        renderer.paint();
        const lights = gpu.lastWriteTo('lights');
        expect(lights.slice(4, 11)).toEqual([0.25, 1, 0.5, 0.5, 1, 0.5, 0.25]);
    });

    it('softens shadows more the further they are from the player, by the same world distance at any zoom', async () => {
        const { renderer, gpu } = await readyRenderer();
        const camera = cameraOnOrigin();
        camera.setTarget(new Vector(100, 50));
        const zoomedRenderer = new GpuRenderer(camera);
        await zoomedRenderer.init(gpu.gpu);
        renderer.setLighting(lightingWith([]));
        zoomedRenderer.setLighting(lightingWith([]));

        renderer.paint();
        const [, , , softestDistance, , , , , , , near, far] = gpu.lastWriteTo('camera');
        expect(far).toBeGreaterThan(near);
        expect(softestDistance).toBeGreaterThan(0);

        camera.zoomBy(1);
        zoomedRenderer.paint();
        const zoomed = gpu.lastWriteTo('camera');
        expect(zoomed.slice(8, 12)).toEqual([100, 50, near * 2, far * 2]);
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

    it('rebuilds its light targets when the canvas is resized, blurring at half resolution', async () => {
        const canvas = { width: 1200, height: 600 };
        const { renderer, gpu } = await readyRenderer(canvas);
        renderer.paint();
        renderer.paint();
        const targets = (label : string) => gpu.textures.filter((texture) => texture.label === label);
        expect(targets('light').map((texture) => texture.size)).toEqual([[1200, 600]]);
        expect(targets('soft light').map((texture) => texture.size)).toEqual([[600, 300]]);
        canvas.width = 1921;
        renderer.paint();
        expect(targets('light').map((texture) => texture.isDestroyed)).toEqual([true, false]);
        expect(targets('shadow blur').map((texture) => texture.isDestroyed)).toEqual([true, false]);
        expect(targets('soft light').at(-1)?.size).toEqual([961, 300]);
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

    it('uploads a sprite\'s normal map once, without premultiplying it, alongside its colours', async () => {
        const { renderer, gpu } = await readyRenderer();
        const normals = { width: 64, height: 64 } as HTMLImageElement;
        renderer.render([sprite({ normals }), sprite({ normals })]);
        renderer.paint();
        renderer.paint();
        expect(gpu.uploadsTo('normals').map((upload) => upload.isPremultiplied)).toEqual([false]);
        expect(gpu.uploadsTo('sprite').map((upload) => upload.isPremultiplied)).toEqual([true]);
        expect(gpu.draws.at(-1)?.instanceCount).toBe(2);
    });

    it('frees a normal map texture when it is released', async () => {
        const { renderer, gpu } = await readyRenderer();
        const normals = { width: 64, height: 64 } as HTMLImageElement;
        renderer.render([sprite({ normals })]);
        renderer.paint();
        renderer.release(normals);
        const normalTextures = gpu.textures.filter((texture) => texture.label === 'normals');
        expect(normalTextures.map((texture) => texture.isDestroyed)).toEqual([true]);
    });

    it('tells the sprite shaders how many lights to shade normals with, and none without lighting', async () => {
        const { renderer, gpu } = await readyRenderer();
        renderer.paint();
        expect(gpu.lastWriteTo('camera')[12]).toBe(0);
        renderer.setLighting(lightingWith([new Light(new Vector(0, 0), { radius: 500, isSight: true }), new Light(new Vector(0, 0), { radius: 600 })]));
        renderer.paint();
        const [lightCount, normalStrength, lightHeight] = gpu.lastWriteTo('camera').slice(12, 15);
        expect(lightCount).toBe(2);
        expect(normalStrength).toBeGreaterThan(0);
        expect(lightHeight).toBeGreaterThan(0);
    });
});
