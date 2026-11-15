const ASSET_PATH = 'assets/';

const images = new Map<string, Promise<HTMLImageElement>>();
const sounds = new Map<string, Promise<HTMLAudioElement>>();
const pending = new Set<Promise<unknown>>();

function track<T>(label : string, request : Promise<T>) : Promise<T> {
    console.info(`Loading ${label}`);
    pending.add(request);
    const settle = () => pending.delete(request);
    request.then(settle, settle);
    return request;
}

/** Loads (once) and decodes `assets/img/<name>.png`. */
export function loadImage(name : string) : Promise<HTMLImageElement> {
    let request = images.get(name);
    if (request === undefined) {
        const img = new Image();
        img.src = `${ASSET_PATH}img/${name}.png`;
        request = track(`${name} image`, img.decode().then(() => img));
        images.set(name, request);
    }
    return request;
}

/** Loads (once) `assets/audio/<name>.mp3`, resolving when it can play through. */
export function loadSound(name : string) : Promise<HTMLAudioElement> {
    let request = sounds.get(name);
    if (request === undefined) {
        const audio = new Audio(`${ASSET_PATH}audio/${name}.mp3`);
        request = track(`${name} audio`, new Promise<HTMLAudioElement>((resolve, reject) => {
            audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
            audio.addEventListener('error', () => reject(new Error(`Failed to load audio: ${name}`)), { once: true });
        }));
        sounds.set(name, request);
    }
    return request;
}

/** Resolves once every requested asset (including ones requested while waiting) has settled. */
export async function whenAssetsLoaded() : Promise<void> {
    while (pending.size > 0) {
        await Promise.allSettled(pending);
    }
}
