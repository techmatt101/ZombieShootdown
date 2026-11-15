const EVICT_AFTER_UNUSED_FRAMES = 300;
const EVICTION_INTERVAL_FRAMES = 60;

interface MaskEntry {
    texture : GPUTexture;
    bindGroup : GPUBindGroup;
    version : number;
    lastUsedFrame : number;
}

export class MaskTextures {
    #device : GPUDevice;
    #layout : GPUBindGroupLayout;
    #sampler : GPUSampler;
    #size : number;
    #entries = new Map<Uint8Array, MaskEntry>();
    #frame = 0;

    constructor(device : GPUDevice, layout : GPUBindGroupLayout, sampler : GPUSampler, size : number) {
        this.#device = device;
        this.#layout = layout;
        this.#sampler = sampler;
        this.#size = size;
    }

    bindGroupFor(mask : Uint8Array, version : number) : GPUBindGroup {
        const entry = this.#entries.get(mask) ?? this.#create(mask);
        if (entry.version !== version) {
            this.#device.queue.writeTexture({ texture: entry.texture }, mask, { bytesPerRow: this.#size }, [this.#size, this.#size]);
            entry.version = version;
        }
        entry.lastUsedFrame = this.#frame;
        return entry.bindGroup;
    }

    endFrame() {
        this.#frame++;
        if (this.#frame % EVICTION_INTERVAL_FRAMES !== 0) return;
        for (const [mask, entry] of this.#entries) {
            if (this.#frame - entry.lastUsedFrame > EVICT_AFTER_UNUSED_FRAMES) {
                entry.texture.destroy();
                this.#entries.delete(mask);
            }
        }
    }

    dispose() {
        for (const entry of this.#entries.values()) {
            entry.texture.destroy();
        }
        this.#entries.clear();
    }

    #create(mask : Uint8Array) {
        const texture = this.#device.createTexture({
            label: 'map memory',
            size: [this.#size, this.#size],
            format: 'r8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
        const bindGroup = this.#device.createBindGroup({
            layout: this.#layout,
            entries: [
                { binding: 0, resource: texture.createView() },
                { binding: 1, resource: this.#sampler },
            ],
        });
        const entry = { texture, bindGroup, version: -1, lastUsedFrame: this.#frame };
        this.#entries.set(mask, entry);
        return entry;
    }
}
