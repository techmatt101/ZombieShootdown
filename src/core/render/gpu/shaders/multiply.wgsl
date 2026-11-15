@group(1) @binding(0) var lightTexture : texture_2d<f32>;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    var corners = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
    return vec4f(corners[vertexIndex], 0.0, 1.0);
}

@fragment
fn fragmentMain(@builtin(position) position : vec4f) -> @location(0) vec4f {
    let brightness = textureLoad(lightTexture, vec2i(position.xy), 0).r;
    return vec4f(brightness, brightness, brightness, 1.0);
}
