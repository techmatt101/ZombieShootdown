import { Vector } from '../lib/geometry/Vector';
import type { Canvas } from '../lib/Canvas';

export interface RecordedCall {
    method : string;
    args : unknown[];
}

export function recordingContext() {
    const calls : RecordedCall[] = [];
    const record = (method : string) => (...args : unknown[]) => {
        calls.push({ method, args });
    };
    const context = {
        fillStyle: '',
        globalCompositeOperation: 'source-over',
        imageSmoothingEnabled: true,
        globalAlpha: 1,
        clearRect: record('clearRect'),
        fillRect: record('fillRect'),
        drawImage: record('drawImage'),
        save: record('save'),
        restore: record('restore'),
        rotate: record('rotate'),
        scale: record('scale'),
        translate: record('translate'),
        setTransform: record('setTransform'),
        beginPath: record('beginPath'),
        moveTo: record('moveTo'),
        lineTo: record('lineTo'),
        fill: record('fill'),
        arc: record('arc'),
        clip: record('clip'),
        createRadialGradient: () => ({ addColorStop() {} }),
        createLinearGradient: () => ({ addColorStop() {} }),
    };
    const count = (method : string) => {
        let total = 0;
        for (let i = 0; i < calls.length; i++) {
            if (calls[i].method === method) total++;
        }
        return total;
    };
    return { context : context as unknown as CanvasRenderingContext2D, calls, count };
}

export function fakeCanvas(context : CanvasRenderingContext2D, width = 1200, height = 600) : Canvas {
    return { element: {} as HTMLCanvasElement, context, width, height, center: new Vector(width / 2, height / 2) } as Canvas;
}

export class FakeOffscreenCanvas {
    width : number;
    height : number;

    constructor(width : number, height : number) {
        this.width = width;
        this.height = height;
    }

    getContext() {
        return recordingContext().context;
    }
}
