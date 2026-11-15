import { describe, expect, it } from 'vitest';
import { DebugSystem } from './DebugSystem';
import { Camera } from '../../lib/Camera';
import { Vector } from '../../lib/geometry/Vector';
import { recordingContext } from '../../testing/fakeCanvas';

describe('DebugSystem', () => {
    it('draws overlays in world space, then puts the view back', () => {
        const camera = new Camera({ x: 600, y: 300 });
        camera.setTarget(new Vector(1000, 500));
        camera.jumpToTarget();
        const system = new DebugSystem(camera);
        const { context, calls } = recordingContext();
        system.addOverlay({ drawDebug: (ctx) => ctx.fillRect(0, 0, 1, 1) });
        system.paint(context);
        expect(calls.map((call) => call.method)).toEqual(['scale', 'translate', 'fillRect', 'translate', 'scale']);
        expect(calls[1].args).toEqual([-400, -200]);
    });
});
