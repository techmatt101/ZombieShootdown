const WARM_GLOW_BLUE_PER_GREEN = 0.4;

@group(1) @binding(0) var softLightTexture : texture_2d<f32>;
@group(1) @binding(1) var softLightSampler : sampler;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    return fullscreenTriangle(vertexIndex);
}

fn softLightAt(position : vec4f) -> vec4f {
    return textureSample(softLightTexture, softLightSampler, position.xy / camera.viewport.xy);
}

@fragment
fn darkenMain(@builtin(position) position : vec4f) -> @location(0) vec4f {
    let brightness = softLightAt(position).r;
    return vec4f(brightness, brightness, brightness, 1.0);
}

@fragment
fn warmGlowMain(@builtin(position) position : vec4f) -> @location(0) vec4f {
    let light = softLightAt(position);
    let red = light.b;
    let green = light.a;
    return vec4f(red, green, green * WARM_GLOW_BLUE_PER_GREEN, 0.0);
}
