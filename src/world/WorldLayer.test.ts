import { describe, expect, it } from 'vitest';
import { CHUNK_SIZE } from './constants';
import { generateChunk } from './generateChunk';
import { WorldLayer } from './WorldLayer';
import { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';
import { recordingContext } from '../testing/fakeCanvas';
import { FakeChunkSource } from '../testing/worldFixtures';

describe('WorldLayer', () => {
    it('draws the bitmap of every chunk in view, and only those', () => {
        const chunks = new FakeChunkSource();
        for (let cx = -3; cx <= 3; cx++) {
            const chunk = chunks.load(generateChunk(1, cx, 0));
            chunk.bitmap = { cx } as unknown as ImageBitmap;
        }
        const camera = new Camera({ x: 600, y: 300 });
        camera.setTarget(new Vector(CHUNK_SIZE / 2, CHUNK_SIZE / 2));
        camera.jumpToTarget();
        const { context, calls } = recordingContext();
        new WorldLayer(chunks, camera).draw(context);
        const drawnAt : number[] = [];
        for (let i = 0; i < calls.length; i++) {
            drawnAt.push(calls[i].args[1] as number);
        }
        expect(drawnAt.sort((a, b) => a - b)).toEqual([-CHUNK_SIZE, 0, CHUNK_SIZE]);
    });
});
