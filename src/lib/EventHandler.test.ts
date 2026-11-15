import { describe, expect, it } from 'vitest';
import { EventHandler } from './EventHandler';

enum TestEvent {
    A,
    B,
}

describe('EventHandler', () => {
    it('calls every listener for the fired event with its data', () => {
        const handler = new EventHandler<TestEvent>();
        const received : unknown[] = [];
        handler.add(TestEvent.A, (data) => received.push(['first', data]));
        handler.add(TestEvent.A, (data) => received.push(['second', data]));
        handler.add(TestEvent.B, () => received.push('wrong event'));
        handler.fire(TestEvent.A, 42);
        expect(received).toEqual([['first', 42], ['second', 42]]);
    });

    it('stops calling a removed listener', () => {
        const handler = new EventHandler<TestEvent>();
        let calls = 0;
        const listener = () => calls++;
        handler.add(TestEvent.A, listener);
        handler.remove(TestEvent.A, listener);
        handler.fire(TestEvent.A);
        expect(calls).toBe(0);
    });

    it('drops every listener on clear', () => {
        const handler = new EventHandler<TestEvent>();
        let calls = 0;
        handler.add(TestEvent.A, () => calls++);
        handler.clear();
        handler.fire(TestEvent.A);
        expect(calls).toBe(0);
    });
});
