import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskCollection } from './TaskCollection';

beforeEach(() => {
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'time').mockImplementation(() => {});
    vi.spyOn(console, 'timeEnd').mockImplementation(() => {});
});

describe('TaskCollection', () => {
    it('runs tasks in order, waiting for async ones', async () => {
        const order : string[] = [];
        await new TaskCollection('setup')
            .add('first', async () => {
                await Promise.resolve();
                order.push('first');
            })
            .add('second', () => {
                order.push('second');
            })
            .run();
        expect(order).toEqual(['first', 'second']);
    });

    it('rejects when a task fails', async () => {
        const failing = new TaskCollection('setup').add('broken', () => {
            throw new Error('boom');
        });
        await expect(failing.run()).rejects.toThrow('boom');
    });
});
