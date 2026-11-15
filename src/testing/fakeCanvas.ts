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
        strokeStyle: '',
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
        stroke: record('stroke'),
        strokeRect: record('strokeRect'),
        arc: record('arc'),
        clip: record('clip'),
        closePath: record('closePath'),
        putImageData: record('putImageData'),
        getImageData: (x : number, y : number, width : number, height : number) => ({ data: new Uint8ClampedArray(width * height * 4), width, height }),
        createImageData: (width : number, height : number) => ({ data: new Uint8ClampedArray(width * height * 4), width, height }),
        createRadialGradient: () => ({ addColorStop() {} }),
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

export class FakeOffscreenCanvas {
    width : number;
    height : number;
    readonly recording = recordingContext();

    constructor(width : number, height : number) {
        this.width = width;
        this.height = height;
    }

    getContext() {
        return this.recording.context;
    }

    transferToImageBitmap() {
        return this as unknown as ImageBitmap;
    }
}
