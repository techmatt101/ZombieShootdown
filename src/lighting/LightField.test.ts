import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LightField } from './LightField';
import type { RememberedChunk } from './MapMemory';
import { computeVisibilityPolygon } from './visibility';
import { Light } from '../core/components/Light';
import { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';
import { recordingContext } from '../testing/fakeCanvas';
import { chunksFromRows } from '../testing/worldFixtures';
import { TileMap } from '../world/TileMap';
import { TileType } from '../world/TileType';

vi.mock('./visibility', () => ({ computeVisibilityPolygon: vi.fn(() => new Float32Array([0, 0, 10, 0, 10, 10])) }));

beforeEach(() => {
    vi.mocked(computeVisibilityPolygon).mockClear();
});

function rememberingMap() {
    const revealed : Float32Array[] = [];
    const remembered = { key: '0,0', left: 0, top: 0, mask: new Uint8Array(1), version: 1 };
    return {
        revealed,
        remembered,
        reveal: (polygon : Float32Array) => revealed.push(polygon),
        rememberedInView: (camera : Camera, out : RememberedChunk[]) => {
            out.length = 0;
            out.push(remembered);
        },
    };
}

describe('LightField', () => {
    it('recomputes each light only when that light moves or the tiles change', () => {
        const tileMap = new TileMap(chunksFromRows(['....', '....']));
        const field = new LightField(tileMap);
        const playerLight = new Light(new Vector(10, 10), { radius: 900 });
        const flashLight = new Light(new Vector(50, 50), { radius: 650 });
        field.setLights([playerLight, flashLight]);

        field.update(1);
        field.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(2);

        (playerLight.pos as Vector).x += 0.2;
        field.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(2);

        (playerLight.pos as Vector).x += 5;
        field.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(3);

        tileMap.setTile(1, 1, TileType.WALL);
        field.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(5);
    });

    it('changes version only when a lit area is recomputed', () => {
        const field = new LightField(new TileMap(chunksFromRows(['....'])));
        const light = new Light(new Vector(10, 10), { radius: 900 });
        field.setLights([light]);
        field.update(1);
        const afterFirst = field.version;
        field.update(1);
        expect(field.version).toBe(afterFirst);
        (light.pos as Vector).x += 5;
        field.update(1);
        expect(field.version).toBeGreaterThan(afterFirst);
    });

    it('keeps the area each light reaches, around where it was computed', () => {
        const field = new LightField(new TileMap(chunksFromRows(['....'])));
        const light = new Light(new Vector(10, 12), { radius: 900 });
        field.setLights([light]);
        expect(field.litAreaOf(light)).toBeUndefined();
        field.update(1);
        expect(field.litAreaOf(light)).toMatchObject({ x: 10, y: 12, radius: 900, polygon: new Float32Array([0, 0, 10, 0, 10, 10]) });
    });

    it('reveals the remembered map with what the player sees, only when their view changes', () => {
        const map = rememberingMap();
        const field = new LightField(new TileMap(chunksFromRows(['....'])), map);
        const eyes = new Light(new Vector(10, 10), { radius: 900, isSight: true });
        field.setLights([eyes, new Light(new Vector(50, 50), { radius: 650 })]);
        field.update(1);
        field.update(1);
        expect(map.revealed.length).toBe(1);
        (eyes.pos as Vector).x += 5;
        field.update(1);
        expect(map.revealed.length).toBe(2);
    });

    it('lists the remembered places in view, or none without a map', () => {
        const map = rememberingMap();
        const camera = new Camera({ x: 600, y: 300 });
        const out : RememberedChunk[] = [];
        new LightField(new TileMap(chunksFromRows(['....'])), map).rememberedInView(camera, out);
        expect(out).toEqual([map.remembered]);
        new LightField(new TileMap(chunksFromRows(['....']))).rememberedInView(camera, out);
        expect(out).toEqual([]);
    });

    it('counts the points of every lit area, for the perf overlay', () => {
        const field = new LightField(new TileMap(chunksFromRows(['....'])));
        field.setLights([new Light(new Vector(0, 0), { radius: 900 }), new Light(new Vector(5, 5), { radius: 600 })]);
        expect(field.pointCount).toBe(0);
        field.update(1);
        expect(field.pointCount).toBe(6);
    });

    it('draws each lit area for debugging: its rays, its outline and its points, coloured by whether it is sight', () => {
        const field = new LightField(new TileMap(chunksFromRows(['....'])));
        field.setLights([new Light(new Vector(0, 0), { radius: 900, isSight: true }), new Light(new Vector(5, 5), { radius: 600 })]);
        field.update(1);
        const { context, calls, count } = recordingContext();
        const strokedWith : string[] = [];
        context.stroke = () => {
            strokedWith.push(String(context.strokeStyle));
        };
        field.drawDebug(context);
        expect(strokedWith).toEqual(['#0ff', '#0ff', '#fa0', '#fa0']);
        expect(count('fillRect')).toBe(6);
        expect(count('save')).toBe(count('restore'));
        expect(calls.filter((call) => call.method === 'moveTo' && call.args[0] === 5 && call.args[1] === 5).length).toBe(3);
    });

    it('recomputes a cone of light when it is aimed somewhere else, passing its arc along', () => {
        const field = new LightField(new TileMap(chunksFromRows(['....'])));
        const facing = { direction: 0 };
        const torch = new Light(new Vector(10, 10), { radius: 700, cone: { aim: facing, halfAngle: 0.4 } });
        field.setLights([torch]);
        field.update(1);
        expect(computeVisibilityPolygon).toHaveBeenLastCalledWith(expect.anything(), 10, 10, 700, { direction: 0, halfAngle: 0.4 });
        facing.direction = 0.005;
        field.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(1);
        facing.direction = 1;
        field.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(2);
        expect(computeVisibilityPolygon).toHaveBeenLastCalledWith(expect.anything(), 10, 10, 700, { direction: 1, halfAngle: 0.4 });
    });

    it('lights all the way round when a light has no cone', () => {
        const field = new LightField(new TileMap(chunksFromRows(['....'])));
        field.setLights([new Light(new Vector(10, 10), { radius: 500 })]);
        field.update(1);
        expect(computeVisibilityPolygon).toHaveBeenLastCalledWith(expect.anything(), 10, 10, 500, null);
    });
});
