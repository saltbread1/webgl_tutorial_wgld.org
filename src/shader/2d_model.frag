precision mediump float;

uniform sampler2D texture0;
uniform bool isTexture;
varying vec4 vColor;
varying vec2 vTextureCoord;

void main() {
    vec4 smpColor0 = texture2D(texture0, vTextureCoord);
    vec4 color = isTexture ? vColor * smpColor0 : vColor;
    gl_FragColor = color;
}
