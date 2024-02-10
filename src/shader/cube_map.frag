precision mediump float;

uniform vec3 eyePosition;
uniform samplerCube cubeTexture;
uniform bool isReflect;
//uniform float eta;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;

void main(void){
    //vec3 ref = isReflect ? refract(normalize(vPosition - eyePosition), vNormal, eta) : vNormal;
    vec3 ref = isReflect ? reflect(vPosition - eyePosition, vNormal) : vNormal;
    vec4 envColor = textureCube(cubeTexture, ref);
    vec4 color = vColor * envColor;
    gl_FragColor = color;
}
