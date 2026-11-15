override blurAxisX : f32;
override blurAxisY : f32;

const TAPS_EACH_SIDE = 6;
const TAP_SPACING_IN_SIGMAS = 0.4;

@group(1) @binding(0) var sourceTexture : texture_2d<f32>;
@group(1) @binding(1) var sourceSampler : sampler;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    return fullscreenTriangle(vertexIndex);
}

fn shadowSoftnessAt(blurPixel : vec2f) -> f32 {
    let screenPixel = blurPixel * camera.viewport.xy / camera.viewport.zw;
    let world = camera.view.xy + screenPixel / camera.view.z;
    let awayFromPlayer = clamp(distance(world, camera.shadow.xy) / camera.view.w, 0.0, 1.0);
    return mix(camera.shadow.z, camera.shadow.w, awayFromPlayer);
}

@fragment
fn fragmentMain(@builtin(position) position : vec4f) -> @location(0) vec4f {
    let uv = position.xy / camera.viewport.zw;
    let softness = shadowSoftnessAt(position.xy);
    let tapStep = vec2f(blurAxisX, blurAxisY) * softness * TAP_SPACING_IN_SIGMAS / camera.viewport.xy;
    var total = vec4f(0.0);
    var weights = 0.0;
    for (var tap = -TAPS_EACH_SIDE; tap <= TAPS_EACH_SIDE; tap++) {
        let spread = f32(tap) * TAP_SPACING_IN_SIGMAS;
        let weight = exp(-0.5 * spread * spread);
        total += textureSampleLevel(sourceTexture, sourceSampler, uv + tapStep * f32(tap), 0.0) * weight;
        weights += weight;
    }
    return total / weights;
}
