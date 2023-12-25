import { readFileSync } from 'fs';

const initCanvas = (): void => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    c.width = 512;
    c.height = 512;

    const gl: WebGLRenderingContext = c.getContext('webgl') as WebGLRenderingContext;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

const setShader = (): void => {
    // const vs: string = `
    //     attribute vec3 position;
    //
    //     void main() {
    //         gl_Position = vec4(position, 1.0);
    //     }
    // `;
    //
    // const fs: string = `
    //     void main() {
    //         gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    //     }
    // `;
    const vs: string = readFileSync('./src/shader/vertex.glsl', 'utf-8');
    const fs: string = readFileSync('./src/shader/fragment.glsl', 'utf-8');
    console.log(vs);

    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const gl: WebGLRenderingContext = c.getContext('webgl') as WebGLRenderingContext;

    const vShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vs) as WebGLShader;
    const fShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fs) as WebGLShader;

    const program: WebGLProgram = createProgram(gl, vShader, fShader) as WebGLProgram;

    const attLocation: number = gl.getAttribLocation(program, 'position');
    const attStride: number = 3;

    const vertexPosition: number[] = [
        0.0, 1.0, 0.0,
        1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ];

    const vbo: WebGLBuffer = createVBO(gl, vertexPosition);
    gl.enableVertexAttribArray(attLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.flush();
};

const createShader = (gl: WebGLRenderingContext, type: number, s: string): WebGLShader | null => {
    const shader: WebGLShader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, s);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    } else {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
};

const createProgram = (gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null => {
    const program: WebGLProgram = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);
        return program;
    } else {
        alert(gl.getProgramInfoLog(program));
        return null;
    }
};

const createVBO = (gl: WebGLRenderingContext, data: number[]): WebGLBuffer => {
    const vbo: WebGLBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vbo;
};

window.addEventListener('DOMContentLoaded', initCanvas);
window.addEventListener('DOMContentLoaded', setShader);
