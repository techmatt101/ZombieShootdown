import { describe, expect, it } from 'vitest';
import { EventCollection } from './EventCollection';

describe('EventCollection', () => {
    it('completes once every listened event has fired', () => {
        let completed = 0, eventsCompleted = 0;
        const collection = new EventCollection(() => completed++, () => eventsCompleted++);
        const first = collection.listen();
        const second = collection.listen();
        first();
        expect(completed).toBe(0);
        second();
        expect(completed).toBe(1);
        expect(eventsCompleted).toBe(2);
    });

    it('runs the per-listener action before completing', () => {
        const order : string[] = [];
        const collection = new EventCollection(() => order.push('complete'));
        collection.listen(() => order.push('action'))();
        expect(order).toEqual(['action', 'complete']);
    });

    it('can be reset to wait for a new number of events', () => {
        let completed = 0;
        const collection = new EventCollection(() => completed++);
        const listener = collection.listen();
        listener();
        collection.reset(2);
        listener();
        expect(completed).toBe(1);
        listener();
        expect(completed).toBe(2);
    });
});
