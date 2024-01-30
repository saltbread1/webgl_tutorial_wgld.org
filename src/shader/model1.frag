#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D texture0;
uniform bool isTexture;
varying vec4 vColor;
varying vec2 vTextureCoord;

void main() {
    vec4 texColor0 = texture2D(texture0, vTextureCoord);
    vec4 color = isTexture ? vColor * texColor0 : vColor;
    gl_FragColor = color;
}
