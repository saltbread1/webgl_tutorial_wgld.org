precision mediump float;

uniform vec3 eyePosition;
uniform samplerCube cubeTexture;
uniform bool isReflection;
uniform float eta;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;

void main(void){
    vec3 ref = isReflection ? refract(normalize(vPosition - eyePosition), vNormal, eta) : vNormal;
    vec4 envColor  = textureCube(cubeTexture, ref);
    vec4 color = vColor * envColor;
    gl_FragColor = envColor;
}
