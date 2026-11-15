import type { TextureSource } from '../../../lib/Texture';

interface UploadedTexture {
    texture : GPUTexture;
    normals : TextureSource | null;
    bindGroup : GPUBindGroup;
}

const WHITE_PIXEL = new Uint8Array([255, 255, 255, 255]);
const FACING_OUT_OF_SCREEN = new Uint8Array([128, 128, 255, 255]);
const RGBA_BYTES = 4;

export class TextureStore {
    #device : GPUDevice;
    #layout : GPUBindGroupLayout;
    #sampler : GPUSampler;
    #uploaded = new WeakMap<TextureSource, UploadedTexture>();
    #normalMaps = new WeakMap<TextureSource, GPUTexture>();
    #owned = new Set<GPUTexture>();
    #flatNormals : GPUTexture;
    #solid : UploadedTexture;

    constructor(device : GPUDevice, layout : GPUBindGroupLayout, sampler : GPUSampler) {
        this.#device = device;
        this.#layout = layout;
        this.#sampler = sampler;
        this.#flatNormals = this.#onePixel('flat normals', FACING_OUT_OF_SCREEN);
        const white = this.#onePixel('solid', WHITE_PIXEL);
        this.#solid = { texture: white, normals: null, bindGroup: this.#bindGroup(white, this.#flatNormals) };
    }

    bindGroupFor(source : TextureSource | null, normals : TextureSource | null = null) : GPUBindGroup {
        if (source === null) return this.#solid.bindGroup;
        const uploaded = this.#uploaded.get(source) ?? this.#upload(source);
        if (uploaded.normals !== normals) {
            uploaded.normals = normals;
            uploaded.bindGroup = this.#bindGroup(uploaded.texture, this.#normalMapFor(normals));
        }
        return uploaded.bindGroup;
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
        this.#normalMaps = new WeakMap();
    }

    #upload(source : TextureSource) {
        const texture = this.#copy('sprite', source, true);
        const uploaded = { texture, normals: null, bindGroup: this.#bindGroup(texture, this.#flatNormals) };
        this.#uploaded.set(source, uploaded);
        return uploaded;
    }

    #normalMapFor(normals : TextureSource | null) {
        if (normals === null) return this.#flatNormals;
        let texture = this.#normalMaps.get(normals);
        if (texture === undefined) {
            texture = this.#copy('normals', normals, false);
            this.#normalMaps.set(normals, texture);
        }
        return texture;
    }

    #copy(label : string, source : TextureSource, isPremultiplied : boolean) {
        const size = [source.width, source.height];
        const texture = this.#device.createTexture({
            label,
            size,
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.#device.queue.copyExternalImageToTexture({ source }, { texture, premultipliedAlpha: isPremultiplied }, size);
        this.#owned.add(texture);
        return texture;
    }

    #onePixel(label : string, pixel : Uint8Array) {
        const texture = this.#device.createTexture({
            label,
            size: [1, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
        this.#device.queue.writeTexture({ texture }, pixel, { bytesPerRow: RGBA_BYTES }, [1, 1]);
        this.#owned.add(texture);
        return texture;
    }

    #bindGroup(texture : GPUTexture, normals : GPUTexture) {
        return this.#device.createBindGroup({
            layout: this.#layout,
            entries: [
                { binding: 0, resource: texture.createView() },
                { binding: 1, resource: this.#sampler },
                { binding: 2, resource: normals.createView() },
            ],
        });
    }
}
