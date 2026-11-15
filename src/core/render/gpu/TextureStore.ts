import type { TextureSource } from '../../../lib/Texture';

interface UploadedTexture {
    texture : GPUTexture;
    bindGroup : GPUBindGroup;
}

const WHITE_PIXEL = new Uint8Array([255, 255, 255, 255]);
const RGBA_BYTES = 4;

export class TextureStore {
    #device : GPUDevice;
    #layout : GPUBindGroupLayout;
    #sampler : GPUSampler;
    #uploaded = new WeakMap<TextureSource, UploadedTexture>();
    #owned = new Set<GPUTexture>();
    #solid : UploadedTexture;

    constructor(device : GPUDevice, layout : GPUBindGroupLayout, sampler : GPUSampler) {
        this.#device = device;
        this.#layout = layout;
        this.#sampler = sampler;
        this.#solid = this.#createSolid();
    }

    bindGroupFor(source : TextureSource | null) : GPUBindGroup {
        if (source === null) return this.#solid.bindGroup;
        return (this.#uploaded.get(source) ?? this.#upload(source)).bindGroup;
    }

    release(source : TextureSource) {
        const uploaded = this.#uploaded.get(source);
        if (uploaded === undefined) return;
        uploaded.texture.destroy();
        this.#owned.delete(uploaded.texture);
        this.#uploaded.delete(source);
    }

    dispose() {
        for (const texture of this.#owned) {
            texture.destroy();
        }
        this.#owned.clear();
        this.#uploaded = new WeakMap();
    }

    #upload(source : TextureSource) {
        const size = [source.width, source.height];
        const texture = this.#device.createTexture({
            label: 'sprite',
            size,
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.#device.queue.copyExternalImageToTexture({ source }, { texture, premultipliedAlpha: true }, size);
        const uploaded = { texture, bindGroup: this.#bindGroup(texture) };
        this.#uploaded.set(source, uploaded);
        this.#owned.add(texture);
        return uploaded;
    }

    #createSolid() {
        const texture = this.#device.createTexture({
            label: 'solid',
            size: [1, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
        this.#device.queue.writeTexture({ texture }, WHITE_PIXEL, { bytesPerRow: RGBA_BYTES }, [1, 1]);
        this.#owned.add(texture);
        return { texture, bindGroup: this.#bindGroup(texture) };
    }

    #bindGroup(texture : GPUTexture) {
        return this.#device.createBindGroup({
            layout: this.#layout,
            entries: [
                { binding: 0, resource: texture.createView() },
                { binding: 1, resource: this.#sampler },
            ],
        });
    }
}
