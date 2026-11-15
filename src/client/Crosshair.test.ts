import { describe, expect, it, vi } from 'vitest';
import { Crosshair } from './Crosshair';
import { spawnPointer } from '../core/factories/InterfaceFactory';
import { Camera } from '../lib/Camera';
import { InputState } from '../lib/controllers/InputState';
import { Vector } from '../lib/geometry/Vector';
import { recordingContext } from '../testing/fakeCanvas';

const crosshairImage = { width: 32, height: 32 };
vi.mock('../lib/assets', () => ({ loadImage: () => Promise.resolve(crosshairImage) }));

async function aimingAt(aimX : number, aimY : number) {
    const camera = new Camera({ x: 600, y: 300 });
    camera.setTarget(new Vector(100, 100));
    camera.jumpToTarget();
    const input = new InputState();
    const pointer = spawnPointer(input, camera);
    input.directionCoordinates.set(aimX, aimY);
    pointer.getComponent('pointer').update(1);
    const crosshair = new Crosshair(camera);
    await Promise.resolve();
    return { crosshair, pointer };
}

describe('Crosshair', () => {
    it('draws the crosshair on the HUD, centred on the aim point on screen', async () => {
        const { crosshair, pointer } = await aimingAt(50, -20);
        const { context, calls } = recordingContext();
        crosshair.paint(context, pointer);
        expect(calls).toEqual([{ method: 'drawImage', args: [crosshairImage, 634, 264, 32, 32] }]);
    });

    it('draws nothing while the aim sits on the player, or before there is a pointer', async () => {
        const { crosshair, pointer } = await aimingAt(3, 0);
        const { context, calls } = recordingContext();
        crosshair.paint(context, pointer);
        crosshair.paint(context, undefined);
        expect(calls).toEqual([]);
    });
});
