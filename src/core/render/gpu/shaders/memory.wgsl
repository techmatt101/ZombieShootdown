override chunkSize : f32;
override rememberedBrightness : f32;

@group(1) @binding(0) var maskTexture : texture_2d<f32>;
@group(1) @binding(1) var maskSampler : sampler;

struct MemoryVertex {
    @builtin(position) position : vec4f,
    @location(0) uv : vec2f,
};

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex : u32, @location(0) origin : vec2f) -> MemoryVertex {
    let corner = quadCorner(vertexIndex);
    var out : MemoryVertex;
    out.position = worldToClip(origin + corner * chunkSize);
    out.uv = corner;
    return out;
}

@fragment
fn fragmentMain(in : MemoryVertex) -> @location(0) vec4f {
    let seen = textureSample(maskTexture, maskSampler, in.uv).r * rememberedBrightness;
    return vec4f(seen, 0.0, 0.0, seen);
}
