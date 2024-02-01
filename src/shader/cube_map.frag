precision mediump float;

uniform vec3        eyePosition;
uniform samplerCube cubeTexture;
uniform bool        isReflection;
varying vec3        vPosition;
varying vec3        vNormal;
varying vec4        vColor;

void main(void){
    vec3 ref = isReflection ? reflect(vPosition - eyePosition, vNormal) : vNormal;
    vec4 envColor  = textureCube(cubeTexture, ref);
    vec4 color = vColor * envColor;
    gl_FragColor = envColor;
}
