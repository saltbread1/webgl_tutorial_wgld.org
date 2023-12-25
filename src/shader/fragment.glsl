#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;

void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 col = (p.xyx + 1.0) * 0.5;
    gl_FragColor = vec4(col, 1.0);
}
