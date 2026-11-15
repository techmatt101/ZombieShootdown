import type { IVector } from '../../lib/geometry/IVector';
import type { Segment } from '../../lib/geometry/Segment';
import type { LineOfSightRequest, LineOfSightResponse } from '../../workers/ai';

let worker : Worker | null = null;
const pending = new Map<number, (visible : boolean) => void>();
let nextId = 0;

function getWorker() {
    if (worker === null) {
        worker = new Worker(new URL('../../workers/ai.ts', import.meta.url), { type: 'module' });
        worker.addEventListener('message', (e : MessageEvent<LineOfSightResponse>) => {
            pending.get(e.data.id)?.(e.data.value);
            pending.delete(e.data.id);
        });
    }
    return worker;
}

export function checkLineOfSight(from : IVector, to : IVector, segments : Segment[]) : Promise<boolean> {
    const id = nextId++;
    const request : LineOfSightRequest = {
        id,
        p1: { x: from.x, y: from.y },
        p2: { x: to.x, y: to.y },
        segments,
    };
    return new Promise((resolve) => {
        pending.set(id, resolve);
        getWorker().postMessage(request);
    });
}
