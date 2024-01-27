#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
attribute vec2 textureCoord;
uniform mat4 mvpMatrix;
uniform mat4 mMatrix;
uniform float vertexAlpha;
uniform float pointSize;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vTextureCoord;

void main() {
    vPosition = (mMatrix * vec4(position, 1.0)).xyz;
    vNormal = normal;
    vColor = vec4(color.rbg, color.a * vertexAlpha);
    vTextureCoord = textureCoord;
    gl_Position = mvpMatrix * vec4(position, 1.0);
    gl_PointSize = pointSize;
}
