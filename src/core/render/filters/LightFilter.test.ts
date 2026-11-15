import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LightFilter } from './LightFilter';
import { computeVisibilityPolygon } from '../../../lighting/visibility';
import { Camera } from '../../../lib/Camera';
import { Vector } from '../../../lib/geometry/Vector';
import { fakeCanvas, recordingContext } from '../../../testing/fakeCanvas';
import { chunksFromRows } from '../../../testing/worldFixtures';
import { TileMap } from '../../../world/TileMap';
import { TileType } from '../../../world/TileType';

vi.mock('../../../lib/assets', () => ({ loadImage: () => new Promise(() => {}) }));
vi.mock('../../../lighting/visibility', () => ({ computeVisibilityPolygon: vi.fn(() => new Float32Array([0, 0, 10, 0, 10, 10])) }));

beforeEach(() => {
    vi.mocked(computeVisibilityPolygon).mockClear();
});

describe('LightFilter', () => {
    it('recomputes the lit area only when the light moves or the tiles change', () => {
        const tileMap = new TileMap(chunksFromRows(['....', '....']));
        const filter = new LightFilter(tileMap);
        const light = new Vector(10, 10);
        filter.setLightSource(light);

        filter.update(1);
        filter.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(1);

        light.x += 0.2;
        filter.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(1);

        light.x += 5;
        filter.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(2);

        tileMap.setTile(1, 1, TileType.WALL);
        filter.update(1);
        expect(computeVisibilityPolygon).toHaveBeenCalledTimes(3);
    });

    it('darkens the whole visible area, at any zoom', () => {
        const filter = new LightFilter(new TileMap(chunksFromRows(['.'])));
        const { context, calls } = recordingContext();
        const camera = new Camera({ x: 600, y: 300 });
        camera.zoomBy(-0.5);
        filter.init(context, fakeCanvas(context), camera);
        const darkness = calls.find((call) => call.method === 'fillRect');
        expect(darkness?.args).toEqual([-600, -300, 2400, 1200]);
    });
});
