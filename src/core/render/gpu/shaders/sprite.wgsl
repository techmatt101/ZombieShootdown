@group(1) @binding(0) var spriteTexture : texture_2d<f32>;
@group(1) @binding(1) var spriteSampler : sampler;
@group(2) @binding(0) var softLightTexture : texture_2d<f32>;
@group(2) @binding(1) var softLightSampler : sampler;

struct SpriteVertex {
    @builtin(position) position : vec4f,
    @location(0) uv : vec2f,
    @location(1) tint : vec4f,
};

@vertex
fn vertexMain(
    @builtin(vertex_index) vertexIndex : u32,
    @location(0) placement : vec4f,
    @location(1) rect : vec4f,
    @location(2) crop : vec4f,
    @location(3) tint : vec4f,
) -> SpriteVertex {
    let corner = quadCorner(vertexIndex);
    let local = rect.xy + corner * rect.zw;
    let cosine = cos(placement.z);
    let sine = sin(placement.z);
    let world = placement.xy + vec2f(local.x * cosine - local.y * sine, local.x * sine + local.y * cosine);
    var out : SpriteVertex;
    out.position = worldToClip(world);
    out.uv = mix(crop.xy, crop.zw, corner);
    out.tint = vec4f(tint.rgb * tint.a, tint.a);
    return out;
}

@fragment
fn fragmentMain(in : SpriteVertex) -> @location(0) vec4f {
    return textureSample(spriteTexture, spriteSampler, in.uv) * in.tint;
}

@fragment
fn fragmentInSight(in : SpriteVertex) -> @location(0) vec4f {
    let sight = textureSample(softLightTexture, softLightSampler, in.position.xy / camera.viewport.xy).g;
    return textureSample(spriteTexture, spriteSampler, in.uv) * in.tint * sight;
}
