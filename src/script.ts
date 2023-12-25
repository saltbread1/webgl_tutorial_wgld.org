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
    const fps: number = 30;
    const initTime: number = new Date().getTime();

    const vs: string = readFileSync('./src/shader/vertex.glsl', 'utf-8');
    const fs: string = readFileSync('./src/shader/fragment.glsl', 'utf-8');

    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const gl: WebGLRenderingContext = c.getContext('webgl') as WebGLRenderingContext;

    const vShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vs) as WebGLShader;
    const fShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fs) as WebGLShader;

    const program: WebGLProgram = createProgram(gl, vShader, fShader) as WebGLProgram;

    const attLocation: number = gl.getAttribLocation(program, 'position');
    const attStride: number = 3;

    const uniLocations: WebGLUniformLocation[] = [];
    uniLocations.push(gl.getUniformLocation(program, 'resolution') as WebGLUniformLocation);
    uniLocations.push(gl.getUniformLocation(program, 'time') as WebGLUniformLocation);

    const vertexPosition: number[] = [
        -0.5,  0.5,  0.0,
        -0.5, -0.5,  0.0,
         0.5, -0.5,  0.0,
         0.5,  0.5,  0.0,
    ];

    const index: number[] = [
        0, 1, 2,
        2, 3, 0,
    ];

    const vbo: WebGLBuffer = createVBO(gl, vertexPosition);
    const ibo: WebGLBuffer = createIBO(gl, index);

    setAttribute(gl, vbo, attLocation, attStride);

    gl.uniform2f(uniLocations[0], c.width * 0.5, c.height * 0.5);

    const render = (): void => {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const time: number = (new Date().getTime() - initTime) * 0.001;
        gl.uniform1f(uniLocations[1], time);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.flush();

        setTimeout(render, 1000 / fps);
    };

    render();
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

const createIBO = (gl: WebGLRenderingContext, data: number[]): WebGLBuffer => {
    const ibo: WebGLBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return ibo;
};

const setAttribute = (gl: WebGLRenderingContext, vbo: WebGLBuffer, attLocation: number, attStride: number): void => {
    gl.enableVertexAttribArray(attLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

window.addEventListener('DOMContentLoaded', initCanvas);
window.addEventListener('DOMContentLoaded', setShader);
