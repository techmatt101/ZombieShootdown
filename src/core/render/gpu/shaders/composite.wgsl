override rememberedBrightness : f32;
override outOfViewLighting : f32;
override exposure : f32;
override contrast : f32;
override brightestLighting : f32;

const DOUBLED_BY_BLEND = 0.5;

@group(1) @binding(0) var softLightTexture : texture_2d<f32>;
@group(1) @binding(1) var softGlowTexture : texture_2d<f32>;
@group(1) @binding(2) var softSampler : sampler;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    return fullscreenTriangle(vertexIndex);
}

fn lightingVisibility(inView : f32) -> f32 {
    return mix(outOfViewLighting, 1.0, saturate(inView));
}

fn toneMapped(lighting : vec3f) -> vec3f {
    let exposed = vec3f(1.0) - exp(-lighting * exposure);
    return pow(exposed, vec3f(contrast)) * brightestLighting;
}

@fragment
fn shadeMain(@builtin(position) position : vec4f) -> @location(0) vec4f {
    let uv = position.xy / camera.viewport.xy;
    let light = textureSample(softLightTexture, softSampler, uv);
    let explored = saturate(textureSample(softGlowTexture, softSampler, uv).a);
    let lighting = light.rgb * lightingVisibility(light.a);
    return vec4f(toneMapped(explored * (rememberedBrightness + lighting)) * DOUBLED_BY_BLEND, 1.0);
}

@fragment
fn warmGlowMain(@builtin(position) position : vec4f) -> @location(0) vec4f {
    let uv = position.xy / camera.viewport.xy;
    let light = textureSample(softLightTexture, softSampler, uv);
    let glow = textureSample(softGlowTexture, softSampler, uv);
    let seen = glow.rgb * saturate(glow.a) * lightingVisibility(light.a);
    return vec4f(pow(seen, vec3f(contrast)), 0.0);
}
