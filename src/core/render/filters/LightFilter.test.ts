import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LightFilter } from './LightFilter';
import { computeVisibilityPolygon } from '../../../lighting/visibility';
import { Camera } from '../../../lib/Camera';
import { Vector } from '../../../lib/geometry/Vector';
import { fakeCanvas, recordingContext } from '../../../testing/fakeCanvas';
import { chunksFromRows } from '../../../testing/worldFixtures';
import { TileMap } from '../../../world/TileMap';
import { TileType } from '../../../world/TileType';
import { Light } from '../../components/Light';

const visionImage = { width: 100, height: 100 };

vi.mock('../../../lib/assets', () => ({ loadImage: () => Promise.resolve(visionImage) }));
vi.mock('../../../lighting/visibility', () => ({ computeVisibilityPolygon: vi.fn(() => new Float32Array([0, 0, 10, 0, 10, 10])) }));

beforeEach(() => {
    vi.mocked(computeVisibilityPolygon).mockClear();
});

async function readyFilter() {
    const tileMap = new TileMap(chunksFromRows(['....', '....']));
    const filter = new LightFilter(tileMap);
    await Promise.resolve();
    return { tileMap, filter };
}

function paint(filter : LightFilter) {
    const { context, calls, count } = recordingContext();
    const camera = new Camera({ x: 600, y: 300 });
    filter.init(context, fakeCanvas(context), camera);
    const afterInit = calls.length;
    filter.close(context, fakeCanvas(context), camera);
    return { calls, count, afterInit, context };
}

describe('LightFilter', () => {
    it('recomputes each light only when that light moves or the tiles change', async () => {
        const { tileMap, filter } = await readyFilter();
        const playerLight = new Light(new Vector(10, 10), { radius: 900 });
        const flashLight = new Light(new Vector(50, 50), { radius: 650 });
        filter.setLights([playerLight, flashLight]);

        filter.update(1);
        filter.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(2);

        (playerLight.pos as Vector).x += 0.2;
        filter.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(2);

        (playerLight.pos as Vector).x += 5;
        filter.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(3);

        tileMap.setTile(1, 1, TileType.WALL);
        filter.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(5);
    });

    it('adds every light together, each only inside what it can reach', async () => {
        const { filter } = await readyFilter();
        const playerLight = new Light(new Vector(0, 0), { radius: 900, isSight: true });
        const flashLight = new Light(new Vector(0, 0), { radius: 650, intensity: 0.8 });
        filter.setLights([playerLight, flashLight]);
        filter.update(1);
        const { calls, afterInit } = paint(filter);
        const brightness = calls.slice(0, afterInit).filter((call) => call.method === 'drawImage');
        expect(brightness.length).toBe(2);
        expect(brightness[0].args.slice(1)).toEqual([-900, -900, 1800, 1800]);
        expect(brightness[1].args.slice(1)).toEqual([-650, -650, 1300, 1300]);
        expect(calls.slice(0, afterInit).filter((call) => call.method === 'clip').length).toBe(2);
    });

    it('reveals the remembered map with what the player sees, only when their view changes', async () => {
        const revealed : Float32Array[] = [];
        const memory = { reveal: (polygon : Float32Array) => revealed.push(polygon), draw: () => {} };
        const filter = new LightFilter(new TileMap(chunksFromRows(['....'])), memory);
        const eyes = new Light(new Vector(10, 10), { radius: 900, isSight: true });
        filter.setLights([eyes, new Light(new Vector(50, 50), { radius: 650 })]);
        filter.update(1);
        filter.update(1);
        expect(revealed.length).toBe(1);
        (eyes.pos as Vector).x += 5;
        filter.update(1);
        expect(revealed.length).toBe(2);
    });

    it('shows remembered places dimly, underneath the lights', async () => {
        const drawnAt : { alpha : number; blend : string }[] = [];
        const memory = {
            reveal: () => {},
            draw: (ctx : CanvasRenderingContext2D) => { drawnAt.push({ alpha: ctx.globalAlpha, blend: ctx.globalCompositeOperation }); },
        };
        const filter = new LightFilter(new TileMap(chunksFromRows(['....'])), memory);
        await Promise.resolve();
        filter.setLights([]);
        paint(filter);
        expect(drawnAt).toEqual([{ alpha: 0.3, blend: 'lighter' }]);
    });

    it('clips to what the player can see, ignoring lights that are not their eyes', async () => {
        const { filter } = await readyFilter();
        filter.setLights([new Light(new Vector(0, 0), { radius: 900, isSight: true }), new Light(new Vector(0, 0), { radius: 650 })]);
        filter.update(1);
        const { context, calls } = recordingContext();
        filter.clipToSight(context);
        expect(calls.filter((call) => call.method === 'moveTo').length).toBe(1);
        expect(calls.at(-1)?.method).toBe('clip');
    });

    it('hides everything that needs sight when the player has no eyes', async () => {
        const { filter } = await readyFilter();
        filter.setLights([]);
        const { context, calls } = recordingContext();
        filter.clipToSight(context);
        expect(calls.map((call) => call.method)).toEqual(['beginPath', 'clip']);
    });

    it('draws the scene only where there is light, then adds warm glow for glowing lights', async () => {
        const { filter } = await readyFilter();
        filter.setLights([new Light(new Vector(0, 0), { radius: 900 }), new Light(new Vector(0, 0), { radius: 650, glow: 0.35 })]);
        filter.update(1);
        const { calls, afterInit, context } = paint(filter);
        expect(calls.slice(afterInit).filter((call) => call.method === 'fillRect').length).toBe(1);
        expect(context.globalCompositeOperation).toBe('source-over');
        expect(context.globalAlpha).toBe(1);
    });

    it('leaves everything dark with no lights', async () => {
        const { filter } = await readyFilter();
        filter.setLights([]);
        filter.update(1);
        const { count } = paint(filter);
        expect(count('drawImage')).toBe(0);
    });
});
