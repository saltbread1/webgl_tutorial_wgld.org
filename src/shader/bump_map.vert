precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
attribute vec2 textureCoord;
uniform   mat4 mMatrix;
uniform   mat4 mvpMatrix;
uniform   mat4 invMatrix;
uniform   vec3 lightPosition;
uniform   vec3 eyePosition;
varying   vec4 vColor;
varying   vec2 vTextureCoord;
varying   vec3 vEyeDirection;
varying   vec3 vLightDirection;

void main(void)
{
    vec3 pos      = (mMatrix * vec4(position, 0.0)).xyz;
    vec3 invEye   = (invMatrix * vec4(eyePosition, 0.0)).xyz;
    vec3 invLight = (invMatrix * vec4(lightPosition, 0.0)).xyz;
    vec3 eye      = invEye - pos; // local eye
    vec3 light    = invLight - pos; // local light

    vec3 n = normal;
    vec3 t = normalize(cross(n, vec3(0.0, 1.0, 0.0)));
    vec3 b = cross(n, t);
    mat3 tMatrix = mat3(t, b, n); // tangent -> local

    // multiply with the transpose(=inverse) tMatrix
    vEyeDirection = normalize(eye * tMatrix); // tangent eye
    vLightDirection = normalize(light * tMatrix); // tangent light

    vColor         = color;
    vTextureCoord  = textureCoord;
    gl_Position    = mvpMatrix * vec4(position, 1.0);
}
