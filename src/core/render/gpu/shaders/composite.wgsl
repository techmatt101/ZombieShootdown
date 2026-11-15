override rememberedBrightness : f32;
override outOfViewLighting : f32;

@group(1) @binding(0) var softLightTexture : texture_2d<f32>;
@group(1) @binding(1) var softGlowTexture : texture_2d<f32>;
@group(1) @binding(2) var softSampler : sampler;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    return fullscreenTriangle(vertexIndex);
}

fn lightingVisibility(inView : f32) -> f32 {
    return mix(outOfViewLighting, 1.0, inView);
}

@fragment
fn darkenMain(@builtin(position) position : vec4f) -> @location(0) vec4f {
    let uv = position.xy / camera.viewport.xy;
    let light = textureSample(softLightTexture, softSampler, uv);
    let explored = textureSample(softGlowTexture, softSampler, uv).a;
    let lighting = light.rgb * lightingVisibility(light.a);
    return vec4f(min(explored * (rememberedBrightness + lighting), vec3f(1.0)), 1.0);
}

@fragment
fn warmGlowMain(@builtin(position) position : vec4f) -> @location(0) vec4f {
    let uv = position.xy / camera.viewport.xy;
    let light = textureSample(softLightTexture, softSampler, uv);
    let glow = textureSample(softGlowTexture, softSampler, uv);
    return vec4f(glow.rgb * glow.a * lightingVisibility(light.a), 0.0);
}
