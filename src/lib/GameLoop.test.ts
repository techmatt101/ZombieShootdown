import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameLoop } from './GameLoop';

let scheduled : Array<((now : number) => void) | null>;

beforeEach(() => {
    scheduled = [];
    vi.stubGlobal('requestAnimationFrame', (callback : (now : number) => void) => scheduled.push(callback));
    vi.stubGlobal('cancelAnimationFrame', (id : number) => {
        scheduled[id - 1] = null;
    });
    vi.spyOn(performance, 'now').mockReturnValue(1000);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function runFrame(now : number) {
    const callback = scheduled[scheduled.length - 1];
    callback?.(now);
}

describe('GameLoop', () => {
    it('reports elapsed time in tenths of a second', () => {
        const steps : number[] = [];
        new GameLoop((dt) => steps.push(dt)).start();
        runFrame(1016);
        runFrame(1066);
        expect(steps[0]).toBeCloseTo(0.16);
        expect(steps[1]).toBeCloseTo(0.5);
    });

    it('caps long frames and ignores timestamps from before the loop started', () => {
        const steps : number[] = [];
        new GameLoop((dt) => steps.push(dt)).start();
        runFrame(990);
        runFrame(5000);
        expect(steps).toEqual([0, 1]);
    });

    it('stops scheduling frames when paused from inside an update', () => {
        const steps : number[] = [];
        const loop = new GameLoop((dt) => {
            steps.push(dt);
            loop.pause();
        });
        loop.start();
        runFrame(1016);
        runFrame(1032);
        expect(steps.length).toBe(1);
    });
});
