import { afterEach, describe, expect, it, vi } from 'vitest';
import { PerfStats } from './PerfStats';

afterEach(() => {
    vi.restoreAllMocks();
});

function mockClock(...times : number[]) {
    const spy = vi.spyOn(performance, 'now');
    for (let i = 0; i < times.length; i++) {
        spy.mockReturnValueOnce(times[i]);
    }
}

describe('PerfStats', () => {
    it('uses the first measurement as is, then smooths towards new ones', () => {
        const stats = new PerfStats();
        mockClock(0, 10, 100, 120);
        stats.begin('update');
        stats.end('update');
        expect(stats.timing('update')).toBe(10);
        stats.begin('update');
        stats.end('update');
        expect(stats.timing('update')).toBeCloseTo(11);
    });

    it('measures frame time between frames', () => {
        const stats = new PerfStats();
        mockClock(0, 16);
        stats.frame();
        stats.frame();
        expect(stats.timing('frame')).toBe(16);
    });

    it('ignores an end without a begin and reports zero for unknown timings', () => {
        const stats = new PerfStats();
        stats.end('never started');
        expect(stats.timing('never started')).toBe(0);
    });

    it('keeps the latest counter values', () => {
        const stats = new PerfStats();
        stats.count('entities', 3);
        stats.count('entities', 5);
        expect([...stats.counters()]).toEqual([['entities', 5]]);
    });
});
