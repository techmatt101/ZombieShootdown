import type { TextureSource } from '../../lib/Texture';

export enum SpriteKind {
    SCENE,
    SCENE_IN_SIGHT,
    ADDITIVE,
    ADDITIVE_IN_SIGHT,
}

export function isAdditiveKind(kind : SpriteKind) {
    return kind === SpriteKind.ADDITIVE || kind === SpriteKind.ADDITIVE_IN_SIGHT;
}

export const FLOATS_PER_SPRITE = 16;
const INITIAL_CAPACITY = 256;
const NORMAL_MAPPED_OFFSET = 3;
const RECT_OFFSET = 4;
const CROP_OFFSET = 8;
const TINT_OFFSET = 12;

export interface SpriteRun {
    source : TextureSource | null;
    normals : TextureSource | null;
    kind : SpriteKind;
    first : number;
    count : number;
}

export interface SpriteLayer {
    queue(batch : SpriteBatch) : void;
}

export interface TextureOwner {
    release(source : TextureSource) : void;
}

export class SpriteBatch {
    #data = new Float32Array(INITIAL_CAPACITY * FLOATS_PER_SPRITE);
    #count = 0;
    #runs : SpriteRun[] = [];
    #runCount = 0;

    get data() {
        return this.#data;
    }

    get count() {
        return this.#count;
    }

    get runCount() {
        return this.#runCount;
    }

    run(index : number) {
        return this.#runs[index];
    }

    reset() {
        this.#count = 0;
        this.#runCount = 0;
    }

    place(source : TextureSource | null, kind : SpriteKind,
          x : number, y : number, rotation : number,
          left : number, top : number, width : number, height : number) {
        if ((this.#count + 1) * FLOATS_PER_SPRITE > this.#data.length) {
            this.#grow();
        }
        const data = this.#data;
        const offset = this.#count * FLOATS_PER_SPRITE;
        data[offset] = x;
        data[offset + 1] = y;
        data[offset + 2] = rotation;
        data[offset + NORMAL_MAPPED_OFFSET] = 0;
        data[offset + RECT_OFFSET] = left;
        data[offset + RECT_OFFSET + 1] = top;
        data[offset + RECT_OFFSET + 2] = width;
        data[offset + RECT_OFFSET + 3] = height;
        data[offset + CROP_OFFSET] = 0;
        data[offset + CROP_OFFSET + 1] = 0;
        data[offset + CROP_OFFSET + 2] = 1;
        data[offset + CROP_OFFSET + 3] = 1;
        data[offset + TINT_OFFSET] = 1;
        data[offset + TINT_OFFSET + 1] = 1;
        data[offset + TINT_OFFSET + 2] = 1;
        data[offset + TINT_OFFSET + 3] = 1;
        this.#extendRun(source, kind);
        this.#count++;
    }

    crop(u0 : number, v0 : number, u1 : number, v1 : number) {
        const offset = (this.#count - 1) * FLOATS_PER_SPRITE + CROP_OFFSET;
        const data = this.#data;
        data[offset] = u0;
        data[offset + 1] = v0;
        data[offset + 2] = u1;
        data[offset + 3] = v1;
    }

    withNormals(normals : TextureSource) {
        this.#data[(this.#count - 1) * FLOATS_PER_SPRITE + NORMAL_MAPPED_OFFSET] = 1;
        this.#runs[this.#runCount - 1].normals = normals;
    }

    tint(red : number, green : number, blue : number, alpha : number) {
        const offset = (this.#count - 1) * FLOATS_PER_SPRITE + TINT_OFFSET;
        const data = this.#data;
        data[offset] = red;
        data[offset + 1] = green;
        data[offset + 2] = blue;
        data[offset + 3] = alpha;
    }

    #extendRun(source : TextureSource | null, kind : SpriteKind) {
        const runs = this.#runs;
        if (this.#runCount > 0) {
            const last = runs[this.#runCount - 1];
            if (last.source === source && last.kind === kind) {
                last.count++;
                return;
            }
        }
        const run = runs[this.#runCount];
        if (run === undefined) {
            runs.push({ source, normals: null, kind, first: this.#count, count: 1 });
        } else {
            run.source = source;
            run.normals = null;
            run.kind = kind;
            run.first = this.#count;
            run.count = 1;
        }
        this.#runCount++;
    }

    #grow() {
        const grown = new Float32Array(this.#data.length * 2);
        grown.set(this.#data);
        this.#data = grown;
    }
}
