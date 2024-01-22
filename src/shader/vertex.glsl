#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform mat4 mvpMatrix;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform vec3 eyeDirection;
uniform vec4 ambientColor;
varying vec4 vColor;

void main() {
    vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    vec3 invEye = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;
    float diffse = clamp(dot(normal, invLight), 0.0, 1.0);
    vec3 reflectDirection = reflect(-invLight, normal);
    float specular = pow(clamp(dot(reflectDirection, invEye), 0.0, 1.0), 16.0);
    vec4 light = color * vec4(vec3(diffse + specular), 1.0);
    vColor = light + ambientColor;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
