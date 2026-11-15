import type { PerfStats } from '../lib/PerfStats';

const LINE_HEIGHT = 14;
const PADDING = 8;
const WIDTH = 210;

export class PerfOverlay {
    #stats : PerfStats;

    constructor(stats : PerfStats) {
        this.#stats = stats;
    }

    paint(ctx : CanvasRenderingContext2D) {
        const frameTime = this.#stats.timing('frame');
        const lines = [`fps ${frameTime > 0 ? Math.round(1000 / frameTime) : 0}`];
        for (const [name, milliseconds] of this.#stats.timings()) {
            lines.push(`${name} ${milliseconds.toFixed(2)}ms`);
        }
        for (const [name, value] of this.#stats.counters()) {
            lines.push(`${name} ${value}`);
        }

        const left = ctx.canvas.width - WIDTH - PADDING;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(left, PADDING, WIDTH, lines.length * LINE_HEIGHT + PADDING);
        ctx.fillStyle = '#0f0';
        ctx.font = '11px monospace';
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], left + PADDING, PADDING + (i + 1) * LINE_HEIGHT);
        }
        ctx.restore();
    }
}
