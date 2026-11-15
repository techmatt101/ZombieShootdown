export type Random = () => number;

const toInt32 = (value : number) => Math.imul(value, 1);

export function hashCoords(...values : number[]) : number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < values.length; i++) {
        hash = Math.imul(hash ^ values[i], 0x9e3779b1);
        hash ^= hash >>> 15;
    }
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    return (hash ^ (hash >>> 16)) >>> 0;
}

export function createRandom(seed : number) : Random {
    let state = seed >>> 0;
    return () => {
        state = toInt32(state + 0x6d2b79f5);
        let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
        mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
}

export function randomInt(random : Random, min : number, max : number) {
    return Math.floor(random() * (max - min + 1)) + min;
}
